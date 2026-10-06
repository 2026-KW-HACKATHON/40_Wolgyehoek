package com.wolgyehoek.dongnae.common;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI dongnaeOpenApi() {
        return new OpenAPI().info(new Info()
                .title("동네서랍 API")
                .description("""
                        월계1동 아이디어 수요 검증·기록 플랫폼.
                        기기 식별은 dn_device 쿠키로 자동 처리된다. 브라우저에서 요청하면 쿠키가 자동으로 붙는다.
                        운영자 기능은 POST /api/operator/enter로 먼저 진입해야 한다.""")
                .version("v1"));
    }
}