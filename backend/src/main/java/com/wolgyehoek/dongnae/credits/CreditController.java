package com.wolgyehoek.dongnae.credits;
import com.wolgyehoek.dongnae.device.DeviceCookieFilter;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/credits")
public class CreditController {
 private final CreditService service;
 public CreditController(CreditService service){this.service=service;}
 public record Swipe(String direction,String reason){}
 public record Announcement(String note){}
 @GetMapping("/wallet") public Map<String,Object> wallet(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String id){return service.wallet(id);}
 @GetMapping("/discover") public Map<String,Object> discover(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String id){return service.discovery(id);}
 @GetMapping("/campaigns/{cardId}") public Map<String,Object> insight(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String id,@PathVariable String cardId){return service.insight(id,cardId);}
 @PostMapping("/campaigns/{cardId}/swipe") public Map<String,Object> swipe(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String id,@PathVariable String cardId,@RequestBody Swipe r){return service.swipe(id,cardId,r.direction(),r.reason());}
 @PostMapping("/campaigns/{cardId}/success-note") public Map<String,Object> announce(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String id,@PathVariable String cardId,@RequestBody Announcement r){return service.announce(id,cardId,r.note());}
 @PostMapping("/campaigns/{cardId}/end") public Map<String,Object> end(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String id,@PathVariable String cardId){return service.end(id,cardId);}
 @PostMapping("/samples") public Map<String,Object> samples(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String id){return service.samples(id);}
}
