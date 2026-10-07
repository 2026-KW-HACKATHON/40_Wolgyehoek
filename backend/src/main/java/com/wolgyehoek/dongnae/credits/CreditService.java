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

/** 반응은 무보상이고, 이유·결론·이어받기처럼 기록을 남긴 행동에만 시연용 기여 포인트를 준다(docs/ROADMAP.md). */
@Service
public class CreditService {
    public static final int REASON_POINTS = 10;
    public static final int CONCLUSION_POINTS = 30;
    public static final int TAKEOVER_POINTS = 20;

    private final JdbcTemplate db;
    private final CardRepository cards;
    private final DeviceService devices;
    private final MediaService media;
    private final boolean enabled;
    public CreditService(JdbcTemplate db, CardRepository cards, DeviceService devices, MediaService media,
                         @Value("${DEMO_CREDITS:false}") boolean enabled) {
        this.db = db; this.cards = cards; this.devices = devices; this.media = media; this.enabled = enabled;
    }
    private void ensureWallet(String device) {
        devices.getOrCreate(device);
        db.update("INSERT INTO credit_wallets(device_id) VALUES (?) ON CONFLICT DO NOTHING", device);
    }
    private int balance(String device) {
        if (!enabled) return 0;
        ensureWallet(device);
        return db.queryForObject("SELECT balance FROM credit_wallets WHERE device_id=?", Integer.class, device);
    }
    /** 포인트를 쓰지 않는 환경에서는 0을 돌려준다. */
    @Transactional
    public int award(String device, int amount, String kind, String description) {
        if (!enabled || amount <= 0) return 0;
        ensureWallet(device);
        db.update("UPDATE credit_wallets SET balance=balance+? WHERE device_id=?", amount, device);
        db.update("INSERT INTO credit_ledger(id,device_id,amount,kind,description) VALUES (?,?,?,?,?)", Ids.newId(), device, amount, kind, description);
        return amount;
    }
    @Transactional
    public Map<String,Object> wallet(String device) {
        if (!enabled) return Map.of("enabled",false,"balance",0,"ledger",List.of());
        ensureWallet(device);
        return Map.of("enabled",true,"balance",balance(device),"ledger",db.queryForList("SELECT amount,kind,description,created_at AS \"createdAt\" FROM credit_ledger WHERE device_id=? AND kind IN ('REASON','RECORD','SWIPE','VOUCHER') ORDER BY created_at DESC,id DESC LIMIT 30",device));
    }
    /** 제안자가 모집을 일찍 마친다. 마감 뒤에는 결론을 기록할 수 있다. */
    @Transactional
    public Map<String,Object> end(String device,String cardId) {
        Card card=cards.findLockedById(cardId).orElseThrow(()->new CardNotFoundException(cardId));
        if(!card.isProposedBy(device)) throw new ForbiddenException("내 아이디어만 마감할 수 있어요.");
        card.closeNow(Instant.now());
        return Map.of("closed",true);
    }
    @Transactional
    public Map<String,Object> swipe(String device, String cardId, String direction, String rawReason) {
        if (direction==null || !Set.of("RIGHT","LEFT").contains(direction)) throw new BadRequestException("반응 방향이 올바르지 않아요.");
        String reason=rawReason==null?"":rawReason.trim();
        int length=reason.replaceAll("\\s","").length();
        if ((!reason.isEmpty() && length<10) || reason.length()>500) throw new BadRequestException("이유는 공백 제외 10자 이상, 전체 500자 이내로 적어 주세요.");
        Card card=cards.findLockedById(cardId).orElseThrow(()->new CardNotFoundException(cardId));
        if (card.isHidden()) throw new CardNotFoundException(cardId);
        devices.getOrCreate(device);
        var existing=db.queryForList("SELECT reward FROM idea_swipes WHERE card_id=? AND device_id=?",cardId,device);
        if (!existing.isEmpty()) return Map.of("reward",existing.getFirst().get("reward"),"balance",balance(device),"duplicate",true);
        if (!card.isOpen(Instant.now())) throw new BadRequestException("참여 기간이 끝났어요. 다음 아이디어를 확인해 주세요.");
        if (card.isProposedBy(device)) throw new BadRequestException("내 아이디어에는 반응할 수 없어요.");
        int reward=reason.isEmpty()?0:award(device,REASON_POINTS,"REASON",card.getTitle()+" · 이유 기록");
        db.update("INSERT INTO idea_swipes(id,card_id,device_id,direction,reason,reward) VALUES (?,?,?,?,?,?)",Ids.newId(),cardId,device,direction,reason,reward);
        long pledges=pledgeCount(cardId);
        boolean succeeded=direction.equals("RIGHT") && card.succeedIfReached(pledges,Instant.now());
        if (succeeded) notifyPledgers(cardId,"SUCCESS");
        return Map.of("reward",reward,"balance",balance(device),"duplicate",false,"pledges",pledges,"goal",card.getGoal(),"succeeded",succeeded);
    }
    @Transactional
    public Map<String,Object> discovery(String device) {
        devices.getOrCreate(device);
        var deck=db.queryForList("""
            SELECT c.id,c.title,c.body,c.target,c.place,c.effect,c.proposer_name AS "proposerName",c.is_seed AS "isSeed",c.ends_at AS "endsAt",
              c.goal,c.succeeded_at AS "succeededAt",c.problem,c.topic,(SELECT count(*) FROM idea_swipes s WHERE s.card_id=c.id AND s.direction='RIGHT') AS pledges
            FROM cards c
            WHERE NOT c.hidden AND c.ends_at>now() AND c.latest_decision IS NULL AND c.origin='' AND c.proposer_id<>?
              AND NOT EXISTS(SELECT 1 FROM idea_swipes s WHERE s.card_id=c.id AND s.device_id=?)
            ORDER BY c.is_seed,c.created_at DESC,c.id LIMIT 50
            """,device,device);
        for(var row:deck) row.put("media",media.forCard((String) row.get("id")));
        return Map.of("enabled",enabled,"cards",deck,"balance",balance(device));
    }
    @Transactional
    public Map<String,Object> samples(String device) {
        // 월계1동 공개 사안을 바탕으로 한 시연 카드다. 출처와 가설 구분은 docs/DEMO-CASES.md에 둔다.
        String owner="d_0000000000000040"; devices.getOrCreate(owner);
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
            db.update("INSERT INTO cards(id,title,body,place,target,effect,problem,topic,goal,proposer_id,proposer_name,starts_at,ends_at,is_seed) VALUES (?,?,?,?,?,?,?,?,?,?,'동네서랍 시연 팀',now(),now()+interval '90 days',true) ON CONFLICT DO NOTHING",item[0],item[1],item[2],item[3],item[4],item[5],item[6],item[7],Integer.parseInt(item[8]),owner);
        }
        return discovery(device);
    }
    @Transactional
    public Map<String,Object> insight(String device,String cardId) {
        boolean operator=devices.getOrCreate(device).operator();
        Card card=cards.findById(cardId).filter(c->!c.isHidden() || operator).orElseThrow(()->new CardNotFoundException(cardId));
        boolean legacy=!card.getOrigin().isEmpty() || Boolean.TRUE.equals(db.queryForObject("SELECT EXISTS(SELECT 1 FROM reactions WHERE card_id=?)",Boolean.class,cardId));
        boolean canManage=card.canBeManagedBy(device,operator);
        boolean visible=canManage || (!card.isOpen(Instant.now()) && card.isReportPublished());
        var mine=db.queryForList("SELECT direction,reason,reward FROM idea_swipes WHERE card_id=? AND device_id=?",cardId,device);
        var result=new LinkedHashMap<String,Object>(); result.put("campaign",!legacy); result.put("visible",visible); result.put("owner",card.isProposedBy(device));
        result.put("mine",mine.isEmpty()?null:mine.getFirst());
        result.put("pledges",pledgeCount(cardId)); result.put("goal",card.getGoal());
        result.put("succeededAt",card.getSucceededAt()); result.put("successNote",card.getSuccessNote());
        result.put("accepting",!card.isHidden() && card.isOpen(Instant.now()) && !card.isProposedBy(device) && mine.isEmpty());
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
