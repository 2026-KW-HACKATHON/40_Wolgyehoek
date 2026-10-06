package com.wolgyehoek.dongnae.common;

import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class IdsTest {

    @Test
    void 열두_자리_16진수를_만든다() {
        assertThat(Ids.newId()).matches("[0-9a-f]{12}");
    }

    @Test
    void 만_번_만들어도_겹치지_않는다() {
        Set<String> ids = new HashSet<>();
        for (int i = 0; i < 10_000; i++) {
            ids.add(Ids.newId());
        }
        assertThat(ids).hasSize(10_000);
    }
}