package com.wolgyehoek.dongnae.assist;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "dongnae.ai.api-key=")
class DraftServiceTest {

    @Autowired
    private DraftService draftService;

    @Test
    void 키가_없으면_규칙_기반으로_만든다() {
        DraftResponse draft = draftService.draft("광운로 공터에서 주말 플리마켓을 열면 좋겠어요");

        assertThat(draft.source()).isEqualTo(DraftSource.RULE);
        assertThat(draft.title()).isEqualTo("광운로 공터에서 주말 플리마켓");
    }
}