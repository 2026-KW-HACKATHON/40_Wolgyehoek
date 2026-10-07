package com.wolgyehoek.dongnae.credits;
import com.wolgyehoek.dongnae.card.*;
import com.wolgyehoek.dongnae.common.*;
import com.wolgyehoek.dongnae.device.DeviceService;
import com.wolgyehoek.dongnae.device.DeviceInfo;
import com.wolgyehoek.dongnae.conclusion.*;
import com.wolgyehoek.dongnae.notice.NoticeRepository;
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
 @Autowired NoticeRepository notices;
 @Autowired com.wolgyehoek.dongnae.media.MediaService media;
 @Autowired CardService cardService;
 String id(){return "d_"+UUID.randomUUID().toString().replace("-","").substring(0,16);}
 Card funded(String owner,int amount){
  devices.getOrCreate(owner);credits.topup(owner,500);
  Card c=cards.save(new Card(Ids.newId(),"크레딧 검증 아이디어","이웃이 반응하고 이유를 남기는 아이디어예요.","이웃","월계1동","연결",owner,"시연 팀",Instant.now(),Instant.now().plusSeconds(3600)));
  credits.fund(owner,c.getId(),amount);return c;
 }
 int balance(String user){return (int)credits.wallet(user).get("balance");}
 int remaining(Card card){return db.queryForObject("SELECT remaining FROM credit_campaigns WHERE card_id=?",Integer.class,card.getId());}
 @Test void positiveAndNegativeArePaidEquallyAndReasonAddsTwenty(){
  Card c=funded(id(),100);String a=id(),b=id();
  assertThat(credits.swipe(a,c.getId(),"RIGHT","").get("reward")).isEqualTo(10);
  assertThat(credits.swipe(b,c.getId(),"LEFT","저녁 시간이 맞지 않아 참여하기 어려워요.").get("reward")).isEqualTo(30);
  assertThat(balance(a)).isEqualTo(10);assertThat(balance(b)).isEqualTo(30);assertThat(remaining(c)).isEqualTo(60);
 }
 @Test void retryOrChangingDirectionNeverPaysTwice(){
  Card c=funded(id(),100);String u=id();credits.swipe(u,c.getId(),"RIGHT","");
  assertThat(credits.swipe(u,c.getId(),"LEFT","다시 참여하면서 보상을 받고 싶은 이유").get("duplicate")).isEqualTo(true);
  assertThat(balance(u)).isEqualTo(10);assertThat(remaining(c)).isEqualTo(90);
  assertThat(db.queryForObject("SELECT count(*) FROM idea_swipes WHERE card_id=?",Integer.class,c.getId())).isEqualTo(1);
 }
 @Test void exhaustedBudgetRejectsWithoutPartialAward(){
  Card c=funded(id(),30);assertThat(credits.insight(id(),c.getId()).get("accepting")).isEqualTo(true);credits.swipe(id(),c.getId(),"LEFT","이런 시간대라면 참여하기 어려울 것 같아요.");String u=id();
  assertThatThrownBy(()->credits.swipe(u,c.getId(),"RIGHT","")).isInstanceOf(BadRequestException.class);
  assertThat(balance(u)).isZero();assertThat(remaining(c)).isZero();assertThat(credits.insight(u,c.getId()).get("accepting")).isEqualTo(false);
 }
 @Test void malformedReasonsAndDirectionsCannotSpendBudget(){
  Card c=funded(id(),100);
  assertThatThrownBy(()->credits.swipe(id(),c.getId(),"RIGHT","짧음")).isInstanceOf(BadRequestException.class);
  assertThatThrownBy(()->credits.swipe(id(),c.getId(),"OTHER","")).isInstanceOf(BadRequestException.class);
  assertThat(remaining(c)).isEqualTo(100);
 }
 @Test void ownerAndOtherTeamCannotManipulateCampaign(){
  String owner=id();Card c=funded(owner,100);
  assertThat(credits.insight(owner,c.getId()).get("accepting")).isEqualTo(false);
  assertThatThrownBy(()->credits.swipe(owner,c.getId(),"RIGHT","")).isInstanceOf(BadRequestException.class);
  assertThatThrownBy(()->credits.fund(id(),c.getId(),30)).isInstanceOf(ForbiddenException.class);
  assertThatThrownBy(()->credits.fund(owner,c.getId(),500)).isInstanceOf(BadRequestException.class);
  assertThat(credits.team(owner).get("balance")).isEqualTo(400);assertThat(remaining(c)).isEqualTo(100);
 }
 @Test void voucherPurchaseRetryAndUseAreIdempotentAndPrivate(){
  String u=id();Card a=funded(id(),100),b=funded(id(),100);credits.swipe(u,a.getId(),"RIGHT","참여해서 이웃들과 이야기를 나누고 싶어요.");credits.swipe(u,b.getId(),"LEFT","주말에는 시간이 맞지 않아 참여하기 어려워요.");String request=UUID.randomUUID().toString();
  var purchase=credits.buy(u,"coffee",request);String voucher=(String)purchase.get("voucherId");
  assertThat(credits.buy(u,"coffee",request).get("voucherId")).isEqualTo(voucher);assertThat(balance(u)).isEqualTo(20);
  assertThatThrownBy(()->credits.buy(u,"meal",request)).isInstanceOf(BadRequestException.class);
  assertThatThrownBy(()->credits.redeem(id(),voucher)).isInstanceOf(NotFoundException.class);
  credits.redeem(u,voucher);credits.redeem(u,voucher);
  assertThat(db.queryForObject("SELECT used_at IS NOT NULL FROM demo_vouchers WHERE id=?",Boolean.class,voucher)).isTrue();
 }
 @Test void insufficientVoucherBalanceDoesNotCreateVoucher(){
  String u=id();
  assertThatThrownBy(()->credits.buy(u,"meal",UUID.randomUUID().toString())).isInstanceOf(BadRequestException.class);
  assertThat(db.queryForObject("SELECT count(*) FROM demo_vouchers WHERE device_id=?",Integer.class,u)).isZero();
 }
 @Test void hiddenAndClosedCardsCannotBeSwiped(){
  Card c=funded(id(),100);c.hide();cards.save(c);
  assertThatThrownBy(()->credits.swipe(id(),c.getId(),"RIGHT","")).isInstanceOf(CardNotFoundException.class);
  Card d=funded(id(),100);d.closeNow(Instant.now());cards.save(d);
  assertThatThrownBy(()->credits.swipe(id(),d.getId(),"RIGHT","")).isInstanceOf(BadRequestException.class);
 }
 @Test void concurrentDuplicateSwipeAwardsOnlyOnce() throws Exception {
  Card c=funded(id(),100);String u=id();devices.getOrCreate(u);credits.wallet(u);
  try(var pool=Executors.newFixedThreadPool(2)){
   var tasks=List.<Callable<Map<String,Object>>>of(()->credits.swipe(u,c.getId(),"RIGHT","이웃들과 함께 참여할 수 있어 정말 기대되는 아이디어예요."),()->credits.swipe(u,c.getId(),"RIGHT","이웃들과 함께 참여할 수 있어 정말 기대되는 아이디어예요."));
   for(var f:pool.invokeAll(tasks))assertThat(f.get().get("reward")).isEqualTo(30);
  }
  assertThat(balance(u)).isEqualTo(30);assertThat(remaining(c)).isEqualTo(70);
 }
 @Test void lastBudgetCannotBeOverspentAcrossConcurrentParticipants() throws Exception {
  Card c=funded(id(),30);String a=id(),b=id();devices.getOrCreate(a);devices.getOrCreate(b);credits.wallet(a);credits.wallet(b);
  try(var pool=Executors.newFixedThreadPool(2)){
   var calls=List.<Callable<Boolean>>of(()->attempt(a,c),()->attempt(b,c));int success=0;for(var f:pool.invokeAll(calls))if(f.get())success++;assertThat(success).isEqualTo(1);
  }
  assertThat(balance(a)+balance(b)).isEqualTo(30);assertThat(remaining(c)).isZero();
 }
 boolean attempt(String u,Card c){try{credits.swipe(u,c.getId(),"LEFT","시간이 잘 맞지 않아서 이번에는 참여하기 어려워요.");return true;}catch(BadRequestException e){return false;}}
 @Test void swipeParticipantsReceiveConclusionEvenWhenTheyPassed(){
  String owner=id(),u=id();Card c=funded(owner,100);credits.swipe(u,c.getId(),"LEFT","");
  c.closeNow(Instant.now());cards.save(c);DeviceInfo actor=devices.getOrCreate(owner);
  conclusions.record(c.getId(),actor,new RecordConclusionRequest(Decision.HOLD,List.of("수요 부족"),"이번 응답을 바탕으로 운영 시간을 다시 검토합니다."));
  assertThat(notices.findByDeviceIdOrderByCreatedAtDesc(u)).hasSize(1);
  assertThat(credits.joinedCardIds(u)).contains(c.getId());
 }
 @Test void explicitFixturesNeverRefillExistingCampaigns(){
  String u=id();credits.samples(u);credits.swipe(u,"wg_walk","RIGHT","");
  int before=db.queryForObject("SELECT remaining FROM credit_campaigns WHERE card_id='wg_walk'",Integer.class);
  credits.samples(u);assertThat(db.queryForObject("SELECT remaining FROM credit_campaigns WHERE card_id='wg_walk'",Integer.class)).isEqualTo(before);
 }
 @Test void fixturesNameTheNeighborhoodProblemAndTopic(){
  @SuppressWarnings("unchecked") var deck=(List<Map<String,Object>>)credits.samples(id()).get("cards");
  var safety=deck.stream().filter(c->c.get("id").equals("wg_safety")).findFirst().orElseThrow();
  assertThat(safety.get("topic")).isEqualTo("SAFETY");
  assertThat((String)safety.get("problem")).contains("광운대역세권");
  assertThat(deck).extracting(c->c.get("topic")).contains("CARE","COMMERCE","SAFETY","ENVIRONMENT","YOUTH","NEIGHBOR");
 }
 @Test void endingCampaignReturnsOnlyUnusedBudgetOnce(){
  String owner=id(),u=id();Card c=funded(owner,100);credits.swipe(u,c.getId(),"LEFT","");
  assertThat(credits.end(owner,c.getId()).get("returned")).isEqualTo(90);
  assertThat(credits.end(owner,c.getId()).get("returned")).isEqualTo(0);
  assertThat(credits.team(owner).get("balance")).isEqualTo(490);assertThat(balance(u)).isEqualTo(10);assertThat(remaining(c)).isZero();
  assertThatThrownBy(()->credits.swipe(id(),c.getId(),"RIGHT","")).isInstanceOf(BadRequestException.class);
 }
 @Test void publicInsightWaitsForPublicationAndHidesSmallRatios(){
  String owner=id(),u=id();Card c=funded(owner,100);credits.swipe(u,c.getId(),"LEFT","시간이 맞지 않아 참여가 어려워 다른 요일을 원해요.");
  assertThat(credits.insight(u,c.getId()).get("visible")).isEqualTo(false);
  assertThat(credits.insight(owner,c.getId()).get("total")).isEqualTo(1);
  credits.end(owner,c.getId());Card ended=cards.findById(c.getId()).orElseThrow();ended.publishReport("시연 결과",Instant.now());cards.save(ended);
  var result=credits.insight(u,c.getId());assertThat(result.get("visible")).isEqualTo(true);assertThat(result.get("showRatio")).isEqualTo(false);
 }
 @Test void teamTopupsCannotPurchaseParticipantVouchers(){
  String u=id();credits.topup(u,500);assertThat(balance(u)).isZero();
  assertThat(credits.team(u).get("balance")).isEqualTo(500);
  assertThatThrownBy(()->credits.buy(u,"coffee",UUID.randomUUID().toString())).isInstanceOf(BadRequestException.class);
 }
 @Test void hiddenCampaignStillAllowsOwnerRefundButNeverParticipation(){
  String owner=id();Card c=funded(owner,100);c.hide();cards.save(c);
  var team=credits.team(owner);assertThat((List<?>)team.get("campaigns")).hasSize(1);
  assertThat(credits.end(owner,c.getId()).get("returned")).isEqualTo(100);
  assertThat(credits.team(owner).get("balance")).isEqualTo(500);
  assertThatThrownBy(()->credits.swipe(id(),c.getId(),"LEFT","")).isInstanceOf(CardNotFoundException.class);
 }
 @Test void hiddenInsightPreservesOperatorAccessAndRejectsOtherDevices(){
  Card c=funded(id(),100);c.hide();cards.save(c);String operator=id();devices.getOrCreate(operator);
  var op=deviceRepository.findById(operator).orElseThrow();op.becomeOperator();deviceRepository.save(op);
  assertThat(credits.insight(operator,c.getId()).get("visible")).isEqualTo(true);
  assertThat(credits.insight(operator,c.getId()).get("accepting")).isEqualTo(false);
  assertThatThrownBy(()->credits.insight(id(),c.getId())).isInstanceOf(CardNotFoundException.class);
 }
 @Test void reachingGoalSucceedsOnceNotifiesPledgersAndOnlyOwnerAnnounces(){
  String owner=id();Card c=funded(owner,300);c.setGoal(2);cards.saveAndFlush(c);
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
  String owner=id();Card c=funded(owner,100);
  assertThatThrownBy(()->credits.announce(owner,c.getId(),"아직 모이는 중이에요")).isInstanceOf(BadRequestException.class);
 }
 @Test void disabledDemoCannotIssueCredits(){
  CreditService disabled=new CreditService(db,cards,devices,media,false);
  assertThat(disabled.wallet(id()).get("enabled")).isEqualTo(false);
  assertThatThrownBy(()->disabled.topup(id(),500)).isInstanceOf(BadRequestException.class);
 }
}
