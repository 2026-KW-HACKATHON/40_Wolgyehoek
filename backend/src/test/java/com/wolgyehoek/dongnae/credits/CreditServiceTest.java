package com.wolgyehoek.dongnae.credits;
import com.wolgyehoek.dongnae.card.*;
import com.wolgyehoek.dongnae.common.*;
import com.wolgyehoek.dongnae.device.DeviceService;
import com.wolgyehoek.dongnae.device.DeviceInfo;
import com.wolgyehoek.dongnae.conclusion.*;
import com.wolgyehoek.dongnae.notice.NoticeRepository;
import com.wolgyehoek.dongnae.takeover.TakeoverRequest;
import com.wolgyehoek.dongnae.takeover.TakeoverService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.*;

@SpringBootTest(properties="DEMO_CREDITS=true")
class CreditServiceTest {
 @Autowired CreditService credits;
 @Autowired CardRepository cards;
 @Autowired JdbcTemplate db;
 @Autowired DeviceService devices;
 @Autowired com.wolgyehoek.dongnae.device.DeviceRepository deviceRepository;
 @Autowired ConclusionService conclusions;
 @Autowired TakeoverService takeovers;
 @Autowired NoticeRepository notices;
 @Autowired com.wolgyehoek.dongnae.media.MediaService media;
 @Autowired CardService cardService;
 @Autowired org.springframework.transaction.support.TransactionTemplate tx;
 String id(){return "d_"+UUID.randomUUID().toString().replace("-","").substring(0,16);}
 Card open(String owner){
  devices.getOrCreate(owner);
  return cards.save(new Card(Ids.newId(),"기록 검증 아이디어","이웃이 반응하고 이유를 남기는 아이디어예요.","이웃","월계1동","연결",owner,"시연 팀",Instant.now(),Instant.now().plusSeconds(3600)));
 }
 int balance(String user){return (int)credits.wallet(user).get("balance");}
 @SuppressWarnings("unchecked") List<String> deckIds(String user){return ((List<Map<String,Object>>)credits.discovery(user).get("cards")).stream().map(c->(String)c.get("id")).toList();}

 @Test void onlyWrittenReasonsEarnPointsInEitherDirection(){
  Card c=open(id());String a=id(),b=id(),d=id();
  assertThat(credits.swipe(a,c.getId(),"RIGHT","").get("reward")).isEqualTo(0);
  assertThat(credits.swipe(b,c.getId(),"LEFT","저녁 시간이 맞지 않아 참여하기 어려워요.").get("reward")).isEqualTo(CreditService.REASON_POINTS);
  assertThat(credits.swipe(d,c.getId(),"RIGHT","주말 오전이라면 아이와 함께 가고 싶어요.").get("reward")).isEqualTo(CreditService.REASON_POINTS);
  assertThat(balance(a)).isZero();assertThat(balance(b)).isEqualTo(10);assertThat(balance(d)).isEqualTo(10);
 }
 @Test void deckShowsOpenCardsWithoutAnyBudget(){
  String owner=id(),u=id();Card c=open(owner);
  assertThat(deckIds(u)).contains(c.getId());assertThat(deckIds(owner)).doesNotContain(c.getId());
  credits.swipe(u,c.getId(),"RIGHT","");
  assertThat(deckIds(u)).doesNotContain(c.getId());
 }
 @Test void retryOrChangingDirectionNeverPaysTwice(){
  Card c=open(id());String u=id();credits.swipe(u,c.getId(),"RIGHT","함께 참여해서 이웃과 이야기를 나누고 싶어요.");
  assertThat(credits.swipe(u,c.getId(),"LEFT","다시 참여하면서 포인트를 받고 싶은 이유").get("duplicate")).isEqualTo(true);
  assertThat(balance(u)).isEqualTo(10);
  assertThat(db.queryForObject("SELECT count(*) FROM idea_swipes WHERE card_id=?",Integer.class,c.getId())).isEqualTo(1);
 }
 @Test void malformedReasonsAndDirectionsAreRejected(){
  Card c=open(id());
  assertThatThrownBy(()->credits.swipe(id(),c.getId(),"RIGHT","짧음")).isInstanceOf(BadRequestException.class);
  assertThatThrownBy(()->credits.swipe(id(),c.getId(),"OTHER","")).isInstanceOf(BadRequestException.class);
  assertThat(db.queryForObject("SELECT count(*) FROM idea_swipes WHERE card_id=?",Integer.class,c.getId())).isZero();
 }
 @Test void ownerCannotReactToOwnCard(){
  String owner=id();Card c=open(owner);
  assertThat(credits.insight(owner,c.getId()).get("accepting")).isEqualTo(false);
  assertThatThrownBy(()->credits.swipe(owner,c.getId(),"RIGHT","")).isInstanceOf(BadRequestException.class);
 }
 @Test void hiddenAndClosedCardsCannotBeSwiped(){
  Card c=open(id());c.hide();cards.save(c);
  assertThatThrownBy(()->credits.swipe(id(),c.getId(),"RIGHT","")).isInstanceOf(CardNotFoundException.class);
  Card d=open(id());d.closeNow(Instant.now());cards.save(d);
  assertThatThrownBy(()->credits.swipe(id(),d.getId(),"RIGHT","")).isInstanceOf(BadRequestException.class);
 }
 @Test void concurrentDuplicateSwipeAwardsOnlyOnce() throws Exception {
  Card c=open(id());String u=id();devices.getOrCreate(u);credits.wallet(u);
  try(var pool=Executors.newFixedThreadPool(2)){
   var tasks=List.<Callable<Map<String,Object>>>of(()->credits.swipe(u,c.getId(),"RIGHT","이웃들과 함께 참여할 수 있어 정말 기대되는 아이디어예요."),()->credits.swipe(u,c.getId(),"RIGHT","이웃들과 함께 참여할 수 있어 정말 기대되는 아이디어예요."));
   for(var f:pool.invokeAll(tasks))assertThat(f.get().get("reward")).isEqualTo(10);
  }
  assertThat(balance(u)).isEqualTo(10);
 }
 @Test void firstConclusionAndTakeoverEarnRecordPointsAndPassersStillHearBack(){
  String owner=id(),u=id(),next=id();Card c=open(owner);credits.swipe(u,c.getId(),"LEFT","");
  credits.end(owner,c.getId());DeviceInfo actor=devices.getOrCreate(owner);
  var hold=new RecordConclusionRequest(Decision.HOLD,List.of("운영 주체 없음"),"운영할 팀을 찾지 못해 잠시 멈춥니다.");
  conclusions.record(c.getId(),actor,hold);conclusions.record(c.getId(),actor,hold);
  assertThat(balance(owner)).isEqualTo(CreditService.CONCLUSION_POINTS);
  assertThat(notices.findByDeviceIdOrderByCreatedAtDesc(u)).isNotEmpty();
  takeovers.takeOver(c.getId(),devices.getOrCreate(next),new TakeoverRequest(new CreateCardRequest("기록 검증 아이디어 2","학생팀이 운영을 맡아 다시 해봐요.",null,null,null,2),"학생팀이 운영을 맡습니다."));
  assertThat(balance(next)).isEqualTo(CreditService.TAKEOVER_POINTS);
  assertThat(credits.wallet(next).get("ledger")).asList().hasSize(1);
 }
 @Test void onlyOwnerCanEndAndEndingStopsNewReactions(){
  String owner=id();Card c=open(owner);
  assertThatThrownBy(()->credits.end(id(),c.getId())).isInstanceOf(ForbiddenException.class);
  credits.end(owner,c.getId());
  assertThatThrownBy(()->credits.swipe(id(),c.getId(),"RIGHT","")).isInstanceOf(BadRequestException.class);
 }
 @Test void fixturesAreIdempotentAndNameTheNeighborhoodProblemAndTopic(){
  String u=id();credits.samples(u);
  @SuppressWarnings("unchecked") var deck=(List<Map<String,Object>>)credits.samples(u).get("cards");
  assertThat(db.queryForObject("SELECT count(*) FROM cards WHERE id LIKE 'wg\\_%'",Integer.class)).isEqualTo(6);
  var safety=deck.stream().filter(c->c.get("id").equals("wg_safety")).findFirst().orElseThrow();
  assertThat(safety.get("topic")).isEqualTo("SAFETY");
  assertThat((String)safety.get("problem")).contains("광운대역세권");
  assertThat(deck).extracting(c->c.get("topic")).contains("CARE","COMMERCE","SAFETY","ENVIRONMENT","YOUTH","NEIGHBOR");
 }
 @Test void publicInsightWaitsForPublicationAndHidesSmallRatios(){
  String owner=id(),u=id();Card c=open(owner);credits.swipe(u,c.getId(),"LEFT","시간이 맞지 않아 참여가 어려워 다른 요일을 원해요.");
  assertThat(credits.insight(u,c.getId()).get("visible")).isEqualTo(false);
  assertThat(credits.insight(owner,c.getId()).get("total")).isEqualTo(1);
  credits.end(owner,c.getId());Card ended=cards.findById(c.getId()).orElseThrow();ended.publishReport("시연 결과",Instant.now());cards.save(ended);
  var result=credits.insight(u,c.getId());assertThat(result.get("visible")).isEqualTo(true);assertThat(result.get("showRatio")).isEqualTo(false);
 }
 @Test void hiddenInsightPreservesOperatorAccessAndRejectsOtherDevices(){
  Card c=open(id());c.hide();cards.save(c);String operator=id();devices.getOrCreate(operator);
  var op=deviceRepository.findById(operator).orElseThrow();op.becomeOperator();deviceRepository.save(op);
  assertThat(credits.insight(operator,c.getId()).get("visible")).isEqualTo(true);
  assertThat(credits.insight(operator,c.getId()).get("accepting")).isEqualTo(false);
  assertThatThrownBy(()->credits.insight(id(),c.getId())).isInstanceOf(CardNotFoundException.class);
 }
 @Test void reachingGoalSucceedsOnceNotifiesPledgersAndOnlyOwnerAnnounces(){
  String owner=id();Card c=open(owner);c.setGoal(2);cards.saveAndFlush(c);
  String a=id(),b=id(),passer=id(),late=id();
  assertThat(credits.swipe(a,c.getId(),"RIGHT","").get("succeeded")).isEqualTo(false);
  assertThat(credits.swipe(passer,c.getId(),"LEFT","").get("succeeded")).isEqualTo(false);
  var tipping=credits.swipe(b,c.getId(),"RIGHT","");
  assertThat(tipping.get("succeeded")).isEqualTo(true);assertThat(tipping.get("pledges")).isEqualTo(2L);
  assertThat(credits.swipe(late,c.getId(),"RIGHT","").get("succeeded")).isEqualTo(false);
  assertThat(cards.findById(c.getId()).orElseThrow().getSucceededAt()).isNotNull();
  assertThat(db.queryForObject("SELECT count(*) FROM notices WHERE card_id=? AND kind='SUCCESS'",Integer.class,c.getId())).isEqualTo(2);
  assertThat(db.queryForObject("SELECT count(*) FROM notices WHERE card_id=? AND device_id=?",Integer.class,c.getId(),passer)).isZero();
  assertThatThrownBy(()->credits.announce(a,c.getId(),"토요일 10시 광운로에서 만나요")).isInstanceOf(ForbiddenException.class);
  assertThat(credits.announce(owner,c.getId(),"토요일 10시 광운로에서 만나요").get("notified")).isEqualTo(3);
  assertThat(credits.insight(passer,c.getId()).get("successNote")).isEqualTo("토요일 10시 광운로에서 만나요");
 }
 @Test void createdCardKeepsProblemAndTopic(){
  var created=cardService.create(new CreateCardRequest("골목 분리배출 안내","학생과 주민이 함께 분리배출 안내판을 붙여요.",null,null,null,2,List.of(),10,"  골목 쓰레기가 쌓여요  ","ENVIRONMENT"),id(),"주민");
  Card saved=cards.findById(created.id()).orElseThrow();
  assertThat(saved.getProblem()).isEqualTo("골목 쓰레기가 쌓여요");assertThat(saved.getTopic()).isEqualTo("ENVIRONMENT");assertThat(saved.getGoal()).isEqualTo(10);
 }
 @Test void announcingBeforeSuccessIsRejected(){
  String owner=id();Card c=open(owner);
  assertThatThrownBy(()->credits.announce(owner,c.getId(),"아직 모이는 중이에요")).isInstanceOf(BadRequestException.class);
 }
 @Test void withoutPointsParticipationStillWorksButNothingIsAwarded(){
  CreditService disabled=new CreditService(db,cards,devices,media,false);
  String u=id();Card c=open(id());
  assertThat(tx.execute(s->disabled.swipe(u,c.getId(),"RIGHT","포인트가 없어도 함께하고 싶은 아이디어예요.")).get("reward")).isEqualTo(0);
  assertThat(disabled.wallet(u).get("enabled")).isEqualTo(false);
  assertThat(db.queryForObject("SELECT count(*) FROM credit_ledger WHERE device_id=?",Integer.class,u)).isZero();
 }
}
