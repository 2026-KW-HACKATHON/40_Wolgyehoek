package com.wolgyehoek.dongnae.institution;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import java.net.URI;
import java.net.http.*;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {"dongnae.operator-code=org-http-code", "dongnae.ai.api-key="})
class InstitutionHttpTest {
    @Value("${local.server.port}") private int port;
    @Autowired private JdbcTemplate sql;
    private final HttpClient client = HttpClient.newHttpClient();
    private HttpResponse<String> call(String method, String path, String body, String device) throws Exception {
        return client.send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path))
                .header("Cookie", "dn_device=" + device).header("Content-Type", "application/json")
                .method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body))
                .build(), HttpResponse.BodyHandlers.ofString());
    }
    private String field(String json, String key) { return json.split("\"" + key + "\":\"")[1].split("\"")[0]; }

    @Test
    void 기관_코드와_권한을_검증하고_기관별_응답을_갱신한다() throws Exception {
        String operator = "d_abcdefab00000011", member = "d_abcdefab00000012", resident = "d_abcdefab00000013";
        String name = "기관-" + UUID.randomUUID();
        assertThat(call("POST", "/api/operator/institutions", "{\"name\":\"기관\"}", resident).statusCode()).isEqualTo(403);
        assertThat(call("GET", "/api/operator/institutions", null, resident).statusCode()).isEqualTo(403);
        assertThat(call("GET", "/api/me/institution", null, resident).body()).isEqualTo("null");
        assertThat(call("POST", "/api/operator/enter", "{\"code\":\"org-http-code\"}", operator).statusCode()).isEqualTo(200);
        assertThat(call("POST", "/api/operator/institutions", "{\"name\":\" \"}", operator).statusCode()).isEqualTo(400);
        var created = call("POST", "/api/operator/institutions", "{\"name\":\"" + name + "\"}", operator);
        assertThat(created.statusCode()).isEqualTo(200);
        String id = field(created.body(), "id"), code = field(created.body(), "code");
        assertThat(code).matches("[A-HJ-NP-Z2-9]{10}");
        assertThat(sql.queryForObject("SELECT code_hash FROM institutions WHERE id = ?", String.class, id)).hasSize(64).isNotEqualTo(code);
        assertThat(call("POST", "/api/operator/institutions", "{\"name\":\"" + name + "\"}", operator).statusCode()).isEqualTo(400);
        assertThat(call("GET", "/api/operator/institutions", null, operator).body()).contains(name).doesNotContain(code, "code_hash");
        assertThat(call("POST", "/api/institutions/enter", "{\"code\":\"wrong\"}", member).statusCode()).isEqualTo(403);
        assertThat(call("POST", "/api/institutions/enter", "{\"code\":\"" + code + "\"}", member).body()).contains(name);
        assertThat(call("GET", "/api/me/institution", null, member).body()).contains(name);
        var card = call("POST", "/api/cards", "{\"title\":\"기관 응답 검증\",\"body\":\"기관 응답을 실제 HTTP 요청으로 확인합니다.\",\"weeks\":2}", operator);
        String cardId = field(card.body(), "id"), path = "/api/cards/" + cardId + "/institution-response";
        assertThat(call("PUT", path, "{\"stance\":\"EMPATHY\",\"comment\":\"공감합니다.\"}", resident).statusCode()).isEqualTo(403);
        assertThat(call("PUT", path, "{\"stance\":\"INVALID\",\"comment\":\"공감합니다.\"}", member).statusCode()).isEqualTo(400);
        assertThat(call("PUT", path, "{\"stance\":\"SUPPORT\",\"comment\":\"x\"}", member).statusCode()).isEqualTo(400);
        assertThat(call("PUT", path, "{\"stance\":\"SUPPORT\",\"comment\":\"" + "가".repeat(501) + "\"}", member).statusCode()).isEqualTo(400);
        assertThat(call("PUT", "/api/cards/missing/institution-response", "{\"stance\":\"SUPPORT\",\"comment\":\"지원합니다.\"}", member).statusCode()).isEqualTo(404);
        for (String stance : new String[]{"EMPATHY", "SUPPORT", "PARTNER"}) {
            assertThat(call("PUT", path, "{\"stance\":\"" + stance + "\",\"comment\":\"협력을 검토합니다.\"}", member).statusCode()).isEqualTo(200);
        }
        assertThat(sql.queryForObject("SELECT count(*) FROM institution_responses WHERE card_id = ?", Integer.class, cardId)).isEqualTo(1);
        var detail = call("GET", "/api/views/cards/" + cardId, null, resident);
        assertThat(detail.body()).contains("\"institutionResponses\":[", name, "\"stance\":\"PARTNER\"", "협력을 검토합니다.", "\"createdAt\"")
                .doesNotContain(code, member);
        assertThat(call("GET", "/api/views/cards", null, resident).body()).doesNotContain("institutionResponses", "institutionCount");
        sql.update("UPDATE cards SET hidden = true WHERE id = ?", cardId);
        assertThat(call("PUT", path, "{\"stance\":\"EMPATHY\",\"comment\":\"공감합니다.\"}", member).statusCode()).isEqualTo(404);
    }
}
