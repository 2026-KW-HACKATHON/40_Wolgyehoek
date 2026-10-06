package com.wolgyehoek.dongnae.views;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Value;
import java.net.URI;
import java.net.http.*;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {"dongnae.operator-code=http-test-code", "dongnae.ai.api-key="})
class ViewsHttpTest {
    @Value("${local.server.port}") private int port;
    private final HttpClient client = HttpClient.newHttpClient();
    private HttpResponse<String> call(String method, String path, String body, String device) throws Exception {
        return client.send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path))
                .header("Cookie", "dn_device=" + device).header("Content-Type", "application/json")
                .method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body))
                .build(), HttpResponse.BodyHandlers.ofString());
    }
    @Test
    void 화면_API는_검색과_기기별_권한을_보존하고_미공개_리포트와_기기키를_노출하지_않는다() throws Exception {
        String owner = "d_abcabcabcabc0001", visitor = "d_abcabcabcabc0002";
        var create = call("POST", "/api/cards", "{\"title\":\"HTTP-unique-card\",\"body\":\"실제 HTTP 흐름 검증을 위한 아이디어입니다.\",\"weeks\":2}", owner);
        assertThat(create.statusCode()).isEqualTo(201);
        String id = create.body().split("\"id\":\"")[1].split("\"")[0];
        var list = call("GET", "/api/views/cards?q=HTTP-unique&tab=open", null, visitor);
        assertThat(list.body()).contains(id).doesNotContain(owner).doesNotContain(visitor);
        assertThat(call("GET", "/api/views/cards?q=HTTP-unique&tab=done", null, visitor).body()).isEqualTo("[]");
        assertThat(call("PATCH", "/api/me/nickname", "{\"nickname\":\"동네 주민\"}", visitor).body()).contains("동네 주민");
        assertThat(call("PATCH", "/api/me/nickname", "{\"nickname\":\"x\"}", visitor).statusCode()).isEqualTo(400);
        assertThat(call("PUT", "/api/cards/" + id + "/reaction", "{\"step\":3,\"price\":5000,\"respondentType\":\"resident\",\"geoInside\":true}", visitor).statusCode()).isEqualTo(200);
        assertThat(call("POST", "/api/operator/enter", "{\"code\":\"http-test-code\"}", owner).statusCode()).isEqualTo(200);
        assertThat(call("POST", "/api/operator/cards/" + id + "/close", null, owner).statusCode()).isEqualTo(200);
        var detail = call("GET", "/api/views/cards/" + id, null, visitor);
        assertThat(detail.statusCode()).isEqualTo(200);
        assertThat(detail.body()).contains("\"report\":null", "\"canManage\":false").doesNotContain(owner).doesNotContain(visitor);
        assertThat(call("POST", "/api/cards/" + id + "/report", "{\"summary\":\"주민 반응을 확인했습니다.\"}", visitor).statusCode()).isEqualTo(403);
        assertThat(call("POST", "/api/cards/" + id + "/report", "{\"summary\":\"주민 반응을 확인했습니다.\"}", owner).statusCode()).isEqualTo(200);
        assertThat(call("GET", "/api/views/cards/" + id, null, visitor).body()).contains("\"showRatio\":false");
        assertThat(call("POST", "/api/cards/" + id + "/conclusions", "{\"decision\":\"HOLD\",\"reasonTags\":[\"운영 주체 없음\"],\"reason\":\"운영팀을 기다려요.\"}", owner).statusCode()).isEqualTo(201);
        assertThat(call("GET", "/api/views/me", null, visitor).body()).contains("CONCLUSION", id);
        assertThat(call("POST", "/api/me/notices/read-all", null, visitor).statusCode()).isEqualTo(200);
        assertThat(call("GET", "/api/me/notices/unread-count", null, visitor).body()).contains("\"count\":0");
        var takeover = call("POST", "/api/cards/" + id + "/takeover", "{\"card\":{\"title\":\"다시 시작하는 시도\",\"body\":\"운영팀이 확보되어 아이디어를 다시 검증합니다.\",\"weeks\":2},\"takeoverNote\":\"학생팀이 운영을 맡습니다.\"}", visitor);
        assertThat(takeover.statusCode()).isEqualTo(201);
        assertThat(takeover.body()).contains("\"parentId\":\"" + id + "\"");
    }
}
