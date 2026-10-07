package com.wolgyehoek.dongnae.credits;
import com.wolgyehoek.dongnae.device.DeviceCookieFilter;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/credits")
public class CreditController {
 private final CreditService service;
 public CreditController(CreditService service){this.service=service;}
 public record Amount(int amount){}
 public record Swipe(String direction,String reason){}
 public record Purchase(String productId,String requestId){}
 @GetMapping("/wallet") public Map<String,Object> wallet(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String id){return service.wallet(id);}
 @GetMapping("/discover") public Map<String,Object> discover(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String id){return service.discovery(id);}
 @GetMapping("/team") public Map<String,Object> team(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String id){return service.team(id);}
 @GetMapping("/campaigns/{cardId}") public Map<String,Object> insight(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String id,@PathVariable String cardId){return service.insight(id,cardId);}
 @GetMapping("/products") public List<CreditService.Product> products(){return CreditService.PRODUCTS;}
 @PostMapping("/topup") public Map<String,Object> topup(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String id,@RequestBody Amount r){return service.topup(id,r.amount());}
 @PostMapping("/campaigns/{cardId}/fund") public Map<String,Object> fund(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String id,@PathVariable String cardId,@RequestBody Amount r){return service.fund(id,cardId,r.amount());}
 @PostMapping("/campaigns/{cardId}/swipe") public Map<String,Object> swipe(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String id,@PathVariable String cardId,@RequestBody Swipe r){return service.swipe(id,cardId,r.direction(),r.reason());}
 @PostMapping("/campaigns/{cardId}/end") public Map<String,Object> end(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String id,@PathVariable String cardId){return service.end(id,cardId);}
 @PostMapping("/vouchers") public Map<String,Object> buy(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String id,@RequestBody Purchase r){return service.buy(id,r.productId(),r.requestId());}
 @PostMapping("/vouchers/{voucherId}/redeem") public Map<String,Object> redeem(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String id,@PathVariable String voucherId){return service.redeem(id,voucherId);}
 @PostMapping("/samples") public Map<String,Object> samples(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String id){return service.samples(id);}
}
