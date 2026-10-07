package com.wolgyehoek.dongnae.credits;

import com.wolgyehoek.dongnae.card.*;
import com.wolgyehoek.dongnae.common.*;
import com.wolgyehoek.dongnae.device.DeviceService;
import com.wolgyehoek.dongnae.media.MediaService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.*;

/** Demo-only closed credit loop. Every debit/award and its record commit together. */
@Service
public class CreditService {
    private final JdbcTemplate db;
    private final CardRepository cards;
    private final DeviceService devices;
    private final MediaService media;
    private final boolean enabled;
    public CreditService(JdbcTemplate db, CardRepository cards, DeviceService devices, MediaService media,
                         @Value("${DEMO_CREDITS:false}") boolean enabled) {
        this.db = db; this.cards = cards; this.devices = devices; this.media = media; this.enabled = enabled;
    }
    public record Product(String id, String title, String shop, String detail, int cost, String category) {}
    public static final List<Product> PRODUCTS = List.of(
        new Product("coffee", "따뜻한 커피 한 잔", "동네 카페 · 가상 매장", "주민의 생각이 동네의 작은 소비로", 40, "카페"),
        new Product("meal", "든든한 한 끼 이용권", "월계 밥집 · 가상 매장", "점심 한 끼를 즐기는 시연용 이용권", 70, "식당"),
        new Product("bakery", "함께 나누는 빵 세트", "골목 베이커리 · 가상 매장", "친구와 나누기 좋은 빵 두 개", 100, "베이커리"));
    private void requireDemo() { if (!enabled) throw new BadRequestException("크레딧 체험이 활성화되지 않았어요."); }
    private void ensureWallet(String device) {
        devices.getOrCreate(device);
        db.update("INSERT INTO credit_wallets(device_id) VALUES (?) ON CONFLICT DO NOTHING", device);
    }
    private int balance(String device) { return db.queryForObject("SELECT balance FROM credit_wallets WHERE device_id=?", Integer.class, device); }
    private int teamBalance(String device) { return db.queryForObject("SELECT team_balance FROM credit_wallets WHERE device_id=?", Integer.class, device); }
    private void entry(String device, int amount, String kind, String title) {
        db.update("INSERT INTO credit_ledger(id,device_id,amount,kind,description) VALUES (?,?,?,?,?)", Ids.newId(),device,amount,kind,title);
    }
    private void debit(String device, int amount) {
        if (db.update("UPDATE credit_wallets SET balance=balance-? WHERE device_id=? AND balance>=?",amount,device,amount)!=1)
            throw new BadRequestException("크레딧이 부족해요. 잔액을 확인해 주세요.");
    }
    @Transactional
    public Map<String,Object> wallet(String device) {
        if (!enabled) return Map.of("enabled",false,"balance",0,"ledger",List.of(),"vouchers",List.of());
        ensureWallet(device);
        return Map.of("enabled",true,"balance",balance(device),"ledger",db.queryForList("SELECT amount,kind,description,created_at AS \"createdAt\" FROM credit_ledger WHERE device_id=? AND kind IN ('SWIPE','VOUCHER') ORDER BY created_at DESC,id DESC LIMIT 30",device),
            "vouchers",db.queryForList("SELECT id,title,cost,created_at AS \"createdAt\",used_at AS \"usedAt\" FROM demo_vouchers WHERE device_id=? ORDER BY created_at DESC",device));
    }
    @Transactional
    public Map<String,Object> topup(String device, int amount) {
        requireDemo(); if (amount!=500 && amount!=1000) throw new BadRequestException("시연 충전은 500C 또는 1,000C를 선택해 주세요.");
        ensureWallet(device);
        if (db.update("UPDATE credit_wallets SET team_balance=team_balance+? WHERE device_id=? AND team_balance<=100000-?",amount,device,amount)!=1)
            throw new BadRequestException("시연 잔액은 최대 100,000C예요.");
        entry(device,amount,"DEMO_TOPUP","팀 예산 시연 충전 · 실제 결제 없음"); return Map.of("balance",teamBalance(device));
    }
    @Transactional
    public Map<String,Object> fund(String device, String cardId, int amount) {
        requireDemo(); if (amount<30 || amount>10000 || amount%10!=0) throw new BadRequestException("예산은 30~10,000C 사이의 10C 단위로 적어 주세요.");
        Card card = cards.findLockedById(cardId).orElseThrow(()->new CardNotFoundException(cardId));
        if (card.isHidden() || !card.isProposedBy(device)) throw new ForbiddenException("내가 올린 아이디어에만 예산을 배정할 수 있어요.");
        if (!card.isOpen(Instant.now())) throw new BadRequestException("진행 중인 아이디어에만 예산을 배정할 수 있어요.");
        ensureWallet(device);
        if(db.update("UPDATE credit_wallets SET team_balance=team_balance-? WHERE device_id=? AND team_balance>=?",amount,device,amount)!=1) throw new BadRequestException("팀 예산이 부족해요. 시연 충전 후 배정해 주세요.");
        db.update("INSERT INTO credit_campaigns(card_id,remaining,funded) VALUES (?,?,?) ON CONFLICT(card_id) DO UPDATE SET remaining=credit_campaigns.remaining+EXCLUDED.remaining,funded=credit_campaigns.funded+EXCLUDED.funded",cardId,amount,amount);
        entry(device,-amount,"FUND",card.getTitle()+" · 참여 보상 예산"); return Map.of("balance",teamBalance(device));
    }
    @Transactional
    public Map<String,Object> end(String device,String cardId) {
        requireDemo(); Card card=cards.findLockedById(cardId).orElseThrow(()->new CardNotFoundException(cardId));
        if(!card.isProposedBy(device)) throw new ForbiddenException("내 아이디어만 마감할 수 있어요.");
        ensureWallet(device);
        var rows=db.queryForList("SELECT remaining FROM credit_campaigns WHERE card_id=? FOR UPDATE",cardId);
        int refund=rows.isEmpty()?0:((Number)rows.getFirst().get("remaining")).intValue();
        card.closeNow(Instant.now());
        if(refund>0){
            db.update("UPDATE credit_campaigns SET remaining=0,returned=returned+? WHERE card_id=?",refund,cardId);
            db.update("UPDATE credit_wallets SET team_balance=team_balance+? WHERE device_id=?",refund,device);
            entry(device,refund,"RETURN",card.getTitle()+" · 남은 참여 예산 반환");
        }
        return Map.of("balance",teamBalance(device),"returned",refund);
    }
    @Transactional
    public Map<String,Object> swipe(String device, String cardId, String direction, String rawReason) {
        requireDemo(); if (direction==null || !Set.of("RIGHT","LEFT").contains(direction)) throw new BadRequestException("반응 방향이 올바르지 않아요.");
        String reason=rawReason==null?"":rawReason.trim();
        int length=reason.replaceAll("\\s","").length();
        if ((!reason.isEmpty() && length<10) || reason.length()>500) throw new BadRequestException("이유는 공백 제외 10자 이상, 전체 500자 이내로 적어 주세요.");
        Card card=cards.findLockedById(cardId).orElseThrow(()->new CardNotFoundException(cardId));
        if (card.isHidden()) throw new CardNotFoundException(cardId);
        ensureWallet(device);
        var existing=db.queryForList("SELECT reward,direction,reason FROM idea_swipes WHERE card_id=? AND device_id=?",cardId,device);
        if (!existing.isEmpty()) return Map.of("reward",existing.getFirst().get("reward"),"balance",balance(device),"duplicate",true);
        if (!card.isOpen(Instant.now())) throw new BadRequestException("참여 기간이 끝났어요. 다음 아이디어를 확인해 주세요.");
        if (card.isProposedBy(device)) throw new BadRequestException("내 아이디어에는 보상 참여를 할 수 없어요.");
        int reward=reason.isEmpty()?10:30;
        // A campaign must afford both choices before showing a card; liking and passing earn equally.
        if (db.update("UPDATE credit_campaigns SET remaining=remaining-? WHERE card_id=? AND remaining>=30",reward,cardId)!=1)
            throw new BadRequestException("이 아이디어의 보상 예산이 소진됐어요. 다음 아이디어를 확인해 주세요.");
        db.update("INSERT INTO idea_swipes(id,card_id,device_id,direction,reason,reward) VALUES (?,?,?,?,?,?)",Ids.newId(),cardId,device,direction,reason,reward);
        db.update("UPDATE credit_wallets SET balance=balance+? WHERE device_id=?",reward,device);
        entry(device,reward,"SWIPE",card.getTitle()+(reason.isEmpty()?" · 반응":" · 반응과 이유"));
        long pledges=pledgeCount(cardId);
        boolean succeeded=direction.equals("RIGHT") && card.succeedIfReached(pledges,Instant.now());
        if (succeeded) notifyPledgers(cardId,"SUCCESS");
        return Map.of("reward",reward,"balance",balance(device),"duplicate",false,"pledges",pledges,"goal",card.getGoal(),"succeeded",succeeded);
    }
    @Transactional
    public Map<String,Object> discovery(String device) {
        if (!enabled) return Map.of("enabled",false,"cards",List.of(),"balance",0);
        ensureWallet(device);
        var deck=db.queryForList("""
            SELECT c.id,c.title,c.body,c.target,c.place,c.effect,c.proposer_name AS "proposerName",c.is_seed AS "isSeed",c.ends_at AS "endsAt",f.remaining,
              c.goal,c.succeeded_at AS "succeededAt",c.problem,c.topic,(SELECT count(*) FROM idea_swipes s WHERE s.card_id=c.id AND s.direction='RIGHT') AS pledges
            FROM cards c JOIN credit_campaigns f ON f.card_id=c.id
            WHERE NOT c.hidden AND c.ends_at>now() AND c.latest_decision IS NULL AND c.proposer_id<>? AND f.remaining>=30
              AND NOT EXISTS(SELECT 1 FROM idea_swipes s WHERE s.card_id=c.id AND s.device_id=?)
            ORDER BY c.is_seed,c.created_at DESC,c.id LIMIT 50
            """,device,device);
        for(var row:deck) row.put("media",media.forCard((String) row.get("id")));
        return Map.of("enabled",true,"cards",deck,"balance",balance(device));
    }
    @Transactional
    public Map<String,Object> team(String device) {
        if (!enabled) return Map.of("enabled",false,"balance",0,"campaigns",List.of());
        ensureWallet(device);
        var list=db.queryForList("""
            SELECT c.id,c.title,c.ends_at AS "endsAt",c.latest_decision AS decision,c.hidden,c.goal,c.succeeded_at AS "succeededAt",c.success_note AS "successNote",(NOT c.hidden AND c.ends_at>now() AND c.latest_decision IS NULL) AS open,COALESCE(f.remaining,0) AS remaining,COALESCE(f.funded,0) AS funded,COALESCE(f.returned,0) AS returned,
              (SELECT count(*) FROM idea_swipes s WHERE s.card_id=c.id AND s.direction='RIGHT') AS likes,
              (SELECT count(*) FROM idea_swipes s WHERE s.card_id=c.id AND s.direction='LEFT') AS passes
            FROM cards c LEFT JOIN credit_campaigns f ON c.id=f.card_id WHERE c.proposer_id=? ORDER BY c.created_at DESC
            """,device);
        for(var row:list) row.put("responses",db.queryForList("SELECT direction,reason,reward,created_at AS \"createdAt\" FROM idea_swipes WHERE card_id=? ORDER BY created_at DESC",row.get("id")));
        return Map.of("enabled",true,"balance",teamBalance(device),"campaigns",list,"ledger",db.queryForList("SELECT amount,description,created_at AS \"createdAt\" FROM credit_ledger WHERE device_id=? AND kind IN ('DEMO_TOPUP','FUND','RETURN') ORDER BY created_at DESC,id DESC LIMIT 30",device));
    }
    @Transactional
    public Map<String,Object> buy(String device,String productId,String requestId) {
        requireDemo(); if (requestId==null || !requestId.matches("[0-9a-f-]{36}")) throw new BadRequestException("구매 요청을 다시 확인해 주세요.");
        Product product=PRODUCTS.stream().filter(p->p.id().equals(productId)).findFirst().orElseThrow(()->new BadRequestException("이용권을 찾을 수 없어요."));
        ensureWallet(device);
        db.queryForObject("SELECT balance FROM credit_wallets WHERE device_id=? FOR UPDATE",Integer.class,device);
        var prior=db.queryForList("SELECT id,product_id FROM demo_vouchers WHERE device_id=? AND request_id=?",device,requestId);
        if (!prior.isEmpty()) {
            if (!prior.getFirst().get("product_id").equals(productId)) throw new BadRequestException("이미 사용된 구매 요청이에요.");
            return Map.of("voucherId",prior.getFirst().get("id"),"balance",balance(device));
        }
        debit(device,product.cost()); String id=Ids.newId();
        db.update("INSERT INTO demo_vouchers(id,device_id,product_id,title,cost,request_id) VALUES (?,?,?,?,?,?)",id,device,productId,product.title(),product.cost(),requestId);
        entry(device,-product.cost(),"VOUCHER",product.title()+" · 시연용 이용권 교환");
        return Map.of("voucherId",id,"balance",balance(device));
    }
    @Transactional
    public Map<String,Object> redeem(String device,String voucherId) {
        requireDemo();
        var row=db.queryForList("SELECT id FROM demo_vouchers WHERE id=? AND device_id=?",voucherId,device);
        if (row.isEmpty()) throw new NotFoundException("내 이용권을 찾을 수 없어요.");
        db.update("UPDATE demo_vouchers SET used_at=now() WHERE id=? AND device_id=? AND used_at IS NULL",voucherId,device);
        return Map.of("ok",true);
    }
    @Transactional
    public Map<String,Object> samples(String device) {
        requireDemo();
        // Explicitly requested, clearly labelled shared fixtures. Repeated setup never refills spent budgets.
        // 월계1동 공개 사안을 바탕으로 한 시연 카드다. 출처와 가설 구분은 docs/DEMO-CASES.md에 둔다.
        String owner="d_0000000000000040"; ensureWallet(owner);
        db.update("UPDATE cards SET ends_at=now() WHERE id IN ('demo_walk40','demo_lunch40','demo_repair40') AND ends_at>now()");
        String[][] items={
            {"wg_safety","공사 구간 우회길·야간 동행 지도","광운대역세권 개발 공사 주변을 학생팀이 직접 걸어 보고 안전한 우회길과 밤길 동행 시간을 지도로 만들어요.","광운대역 일대","공사 구간을 지나 통학·출퇴근하는 주민","공사 기간에도 안심하고 다니는 길","광운대역세권 공사로 통행이 불편하다는 민원이 이어져요","SAFETY","20"},
            {"wg_care","휴센터 스마트폰·키오스크 교실","새로 문을 연 월계어르신휴센터에서 광운대생이 매주 한 번 스마트폰과 키오스크 주문을 1:1로 알려드려요.","월계어르신휴센터","스마트폰 주문이 어려운 어르신","혼자서도 주문하고 예약하는 일상","식당·병원 예약이 키오스크와 앱으로 바뀌어 어르신이 어려워해요","CARE","15"},
            {"wg_youth","청년·주민이 함께 여는 동네 저녁 모임","주민자치회 청년분과와 총학생회가 물은 청년 생활 불편을 이어받아, 한 달에 한 번 청년과 주민이 함께하는 저녁 모임을 열어요.","월계1동","동네에서 할 일을 찾는 청년과 주민","청년이 머물고 싶은 동네","광운대 학생은 많지만 동네 일에 참여할 계기가 적어요","YOUTH","25"},
            {"wg_env","원룸 골목 분리배출 클린데이","원룸이 많은 골목에 학생과 주민이 함께 분리배출 안내판을 붙이고, 한 달에 한 번 같이 골목을 치워요.","광운대 주변 골목","원룸에 사는 학생과 이웃 주민","쓰레기 없는 골목","골목 쓰레기 무단투기가 반복돼요","ENVIRONMENT","20"},
            {"wg_shop","골목 식당 점심 빈자리 함께 먹기","점심 빈자리가 있는 동네 식당에 학생과 혼자 사는 주민이 함께 앉아요. 식당에는 손님을, 이웃에게는 같이 먹을 사람을 연결해요.","광운로","혼밥 대신 함께 먹고 싶은 누구나","손님이 늘어나는 골목 식당","골목 식당은 빈자리가 늘고, 혼자 밥 먹는 이웃도 많아요","COMMERCE","15"},
            {"wg_walk","경춘선숲길 저녁 30분 걷기","퇴근 뒤 경춘선숲길 월계 구간을 이웃과 함께 30분 걸어요. 처음 만난 사람도 인사부터 시작해요.","경춘선숲길","저녁에 걷고 싶은 이웃","인사하는 이웃이 늘어나는 동네","같은 동네에 살아도 이웃과 인사할 계기가 없어요","NEIGHBOR","10"}
        };
        for(var item:items) {
            int added=db.update("INSERT INTO cards(id,title,body,place,target,effect,problem,topic,goal,proposer_id,proposer_name,starts_at,ends_at,is_seed) VALUES (?,?,?,?,?,?,?,?,?,?,'동네서랍 시연 팀',now(),now()+interval '90 days',true) ON CONFLICT DO NOTHING",item[0],item[1],item[2],item[3],item[4],item[5],item[6],item[7],Integer.parseInt(item[8]),owner);
            if(added==1) db.update("INSERT INTO credit_campaigns(card_id,remaining,funded) VALUES (?,3000,3000)",item[0]);
        }
        return discovery(device);
    }
    @Transactional
    public Map<String,Object> insight(String device,String cardId) {
        boolean operator=devices.getOrCreate(device).operator();
        Card card=cards.findById(cardId).filter(c->!c.isHidden() || operator).orElseThrow(()->new CardNotFoundException(cardId));
        boolean campaign=Boolean.TRUE.equals(db.queryForObject("SELECT EXISTS(SELECT 1 FROM credit_campaigns WHERE card_id=?)",Boolean.class,cardId));
        boolean canManage=card.canBeManagedBy(device,operator);
        boolean visible=canManage || (!card.isOpen(Instant.now()) && card.isReportPublished());
        var mine=db.queryForList("SELECT direction,reason,reward FROM idea_swipes WHERE card_id=? AND device_id=?",cardId,device);
        var result=new LinkedHashMap<String,Object>(); result.put("campaign",campaign); result.put("visible",visible);
        result.put("mine",mine.isEmpty()?null:mine.getFirst());
        result.put("pledges",pledgeCount(cardId)); result.put("goal",card.getGoal());
        result.put("succeededAt",card.getSucceededAt()); result.put("successNote",card.getSuccessNote());
        result.put("accepting",enabled && !card.isHidden() && card.isOpen(Instant.now()) && !card.isProposedBy(device) && mine.isEmpty() && Boolean.TRUE.equals(db.queryForObject("SELECT EXISTS(SELECT 1 FROM credit_campaigns WHERE card_id=? AND remaining>=30)",Boolean.class,cardId)));
        if(visible){
            var responses=db.queryForList("SELECT direction,reason FROM idea_swipes WHERE card_id=? ORDER BY created_at DESC",cardId);
            long likes=responses.stream().filter(r->r.get("direction").equals("RIGHT")).count();
            result.put("total",responses.size());result.put("likes",likes);result.put("passes",responses.size()-likes);
            result.put("showRatio",responses.size()>=5);result.put("responses",responses.stream().filter(r->!r.get("reason").equals("")).toList());
        }
        return result;
    }
    /** 성사된 아이디어의 일정·장소를 함께하기로 한 주민 모두에게 알린다. */
    @Transactional
    public Map<String,Object> announce(String device,String cardId,String rawNote) {
        String note=rawNote==null?"":rawNote.trim();
        if (note.length()<2 || note.length()>200) throw new BadRequestException("안내는 2자 이상 200자 이내로 적어 주세요.");
        Card card=cards.findLockedById(cardId).orElseThrow(()->new CardNotFoundException(cardId));
        if (card.isHidden() || !card.isProposedBy(device)) throw new ForbiddenException("내 아이디어에만 안내를 보낼 수 있어요.");
        if (card.getSucceededAt()==null) throw new BadRequestException("성사된 아이디어에만 안내를 보낼 수 있어요.");
        card.announceSuccess(note);
        return Map.of("notified",notifyPledgers(cardId,"SUCCESS_NOTE"));
    }
    private int notifyPledgers(String cardId,String kind) {
        var pledgers=db.queryForList("SELECT device_id FROM idea_swipes WHERE card_id=? AND direction='RIGHT'",String.class,cardId);
        for (String pledger:pledgers) db.update("INSERT INTO notices(id,device_id,card_id,kind,created_at) VALUES (?,?,?,?,now())",Ids.newId(),pledger,cardId,kind);
        return pledgers.size();
    }
    public long pledgeCount(String cardId) { return db.queryForObject("SELECT count(*) FROM idea_swipes WHERE card_id=? AND direction='RIGHT'",Long.class,cardId); }
    public List<String> participantIds(String cardId) { return db.queryForList("SELECT device_id FROM idea_swipes WHERE card_id=?",String.class,cardId); }
    public List<String> joinedCardIds(String deviceId) { return db.queryForList("SELECT card_id FROM idea_swipes WHERE device_id=?",String.class,deviceId); }
}
