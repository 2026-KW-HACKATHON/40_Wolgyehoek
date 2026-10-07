package com.wolgyehoek.dongnae.credits;

import com.wolgyehoek.dongnae.card.*;
import com.wolgyehoek.dongnae.common.*;
import com.wolgyehoek.dongnae.device.DeviceService;
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
    private final boolean enabled;
    public CreditService(JdbcTemplate db, CardRepository cards, DeviceService devices,
                         @Value("${DEMO_CREDITS:false}") boolean enabled) {
        this.db = db; this.cards = cards; this.devices = devices; this.enabled = enabled;
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
        if(card.isHidden() || !card.isProposedBy(device)) throw new ForbiddenException("내 아이디어만 마감할 수 있어요.");
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
        return Map.of("reward",reward,"balance",balance(device),"duplicate",false);
    }
    @Transactional
    public Map<String,Object> discovery(String device) {
        if (!enabled) return Map.of("enabled",false,"cards",List.of(),"balance",0);
        ensureWallet(device);
        var deck=db.queryForList("""
            SELECT c.id,c.title,c.body,c.target,c.place,c.effect,c.proposer_name AS "proposerName",c.is_seed AS "isSeed",c.ends_at AS "endsAt",f.remaining
            FROM cards c JOIN credit_campaigns f ON f.card_id=c.id
            WHERE NOT c.hidden AND c.ends_at>now() AND c.latest_decision IS NULL AND c.proposer_id<>? AND f.remaining>=30
              AND NOT EXISTS(SELECT 1 FROM idea_swipes s WHERE s.card_id=c.id AND s.device_id=?)
            ORDER BY c.is_seed,c.created_at DESC,c.id LIMIT 50
            """,device,device);
        return Map.of("enabled",true,"cards",deck,"balance",balance(device));
    }
    @Transactional
    public Map<String,Object> team(String device) {
        if (!enabled) return Map.of("enabled",false,"balance",0,"campaigns",List.of());
        ensureWallet(device);
        var list=db.queryForList("""
            SELECT c.id,c.title,c.ends_at AS "endsAt",c.latest_decision AS decision,(c.ends_at>now() AND c.latest_decision IS NULL) AS open,COALESCE(f.remaining,0) AS remaining,COALESCE(f.funded,0) AS funded,COALESCE(f.returned,0) AS returned,
              (SELECT count(*) FROM idea_swipes s WHERE s.card_id=c.id AND s.direction='RIGHT') AS likes,
              (SELECT count(*) FROM idea_swipes s WHERE s.card_id=c.id AND s.direction='LEFT') AS passes
            FROM cards c LEFT JOIN credit_campaigns f ON c.id=f.card_id WHERE c.proposer_id=? AND NOT c.hidden ORDER BY c.created_at DESC
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
        String owner="d_0000000000000040"; ensureWallet(owner);
        String[][] items={
            {"demo_walk40","퇴근길, 같이 걸을래요?","경춘선숲길에서 30분만 함께 걸어요. 혼자서는 미루게 되는 산책을 이웃과 가볍게 시작하는 모임이에요.","경춘선숲길","저녁에 산책하고 싶은 이웃","하루의 끝에 건강한 동네 습관"},
            {"demo_lunch40","학생과 주민이 함께하는 점심 식탁","빈자리가 있는 동네 식당에서 학생과 주민이 함께 점심을 먹어요. 식당에는 새로운 손님을, 우리에게는 가까운 이웃을 연결해요.","광운로","혼밥 대신 함께 먹고 싶은 누구나","동네 식당과 함께하는 즐거운 한 끼"},
            {"demo_repair40","고장 난 물건, 버리기 전에 한 번 더","학생 수리팀과 주민이 작은 생활용품을 함께 고쳐봐요. 수리 가능한 물건과 원하는 요일을 의견으로 알려 주세요.","월계1동","수리할 물건이 있는 주민","물건의 수명도, 이웃의 연결도 길게"}
        };
        for(var item:items) {
            int added=db.update("INSERT INTO cards(id,title,body,place,target,effect,proposer_id,proposer_name,starts_at,ends_at,is_seed) VALUES (?,?,?,?,?,?,?,'동네서랍 시연 팀',now(),now()+interval '90 days',true) ON CONFLICT DO NOTHING",item[0],item[1],item[2],item[3],item[4],item[5],owner);
            if(added==1) db.update("INSERT INTO credit_campaigns(card_id,remaining,funded) VALUES (?,3000,3000)",item[0]);
        }
        return discovery(device);
    }
    @Transactional
    public Map<String,Object> insight(String device,String cardId) {
        Card card=cards.findById(cardId).filter(c->!c.isHidden()).orElseThrow(()->new CardNotFoundException(cardId));
        boolean campaign=Boolean.TRUE.equals(db.queryForObject("SELECT EXISTS(SELECT 1 FROM credit_campaigns WHERE card_id=?)",Boolean.class,cardId));
        boolean canManage=card.canBeManagedBy(device,devices.getOrCreate(device).operator());
        boolean visible=canManage || (!card.isOpen(Instant.now()) && card.isReportPublished());
        var mine=db.queryForList("SELECT direction,reason,reward FROM idea_swipes WHERE card_id=? AND device_id=?",cardId,device);
        var result=new LinkedHashMap<String,Object>(); result.put("campaign",campaign); result.put("visible",visible);
        result.put("mine",mine.isEmpty()?null:mine.getFirst());
        if(visible){
            var responses=db.queryForList("SELECT direction,reason FROM idea_swipes WHERE card_id=? ORDER BY created_at DESC",cardId);
            long likes=responses.stream().filter(r->r.get("direction").equals("RIGHT")).count();
            result.put("total",responses.size());result.put("likes",likes);result.put("passes",responses.size()-likes);
            result.put("showRatio",responses.size()>=5);result.put("responses",responses.stream().filter(r->!r.get("reason").equals("")).toList());
        }
        return result;
    }
    public List<String> participantIds(String cardId) { return db.queryForList("SELECT device_id FROM idea_swipes WHERE card_id=?",String.class,cardId); }
    public List<String> joinedCardIds(String deviceId) { return db.queryForList("SELECT card_id FROM idea_swipes WHERE device_id=?",String.class,deviceId); }
}
