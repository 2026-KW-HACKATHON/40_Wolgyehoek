package com.wolgyehoek.dongnae.media;

import com.wolgyehoek.dongnae.card.CardService;
import com.wolgyehoek.dongnae.card.CreateCardRequest;
import com.wolgyehoek.dongnae.common.BadRequestException;
import com.wolgyehoek.dongnae.common.NotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(properties = "dongnae.media.dir=${java.io.tmpdir}/dongnae-media-test")
class MediaServiceTest {

    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0x0D, 'I', 'H', 'D', 'R'};
    private static final byte[] MP4 = {0, 0, 0, 0x18, 'f', 't', 'y', 'p', 'i', 's', 'o', 'm', 0, 0, 2, 0};

    @Autowired private MediaService media;
    @Autowired private CardService cards;

    private CreateCardRequest card(List<String> mediaIds) {
        return new CreateCardRequest("사진 붙인 아이디어", "사진과 영상을 함께 올린 아이디어입니다.", null, null, null, 2, mediaIds);
    }

    @Test
    void 바이트로_형식을_판별하고_게시한_카드에_순서대로_연결한다() {
        MediaView image = media.upload("d_media00000000001", new MockMultipartFile("file", "a.txt", "text/plain", PNG));
        MediaView video = media.upload("d_media00000000001", new MockMultipartFile("file", "b.bin", "application/octet-stream", MP4));
        assertThat(image.kind()).isEqualTo("IMAGE");
        assertThat(image.contentType()).isEqualTo("image/png");
        assertThat(video.contentType()).isEqualTo("video/mp4");

        String cardId = cards.create(card(List.of(video.id(), image.id())), "d_media00000000001", "주민").id();

        assertThat(media.forCard(cardId)).extracting(MediaView::id).containsExactly(video.id(), image.id());
        assertThat(media.load(image.id(), "d_media00000000002", false).contentType()).isEqualTo("image/png");
    }

    @Test
    void 사진이나_영상이_아닌_파일은_거부한다() {
        var text = new MockMultipartFile("file", "a.png", "image/png", "<script>alert(1)</script>".getBytes());
        assertThatThrownBy(() -> media.upload("d_media00000000001", text)).isInstanceOf(BadRequestException.class);
    }

    @Test
    void 남이_올린_파일은_연결하거나_게시_전에_볼_수_없다() {
        MediaView mine = media.upload("d_media00000000001", new MockMultipartFile("file", "a.png", "image/png", PNG));

        assertThatThrownBy(() -> media.load(mine.id(), "d_media00000000002", false)).isInstanceOf(NotFoundException.class);
        assertThatThrownBy(() -> cards.create(card(List.of(mine.id())), "d_media00000000002", "다른 주민"))
                .isInstanceOf(BadRequestException.class);
        assertThat(media.load(mine.id(), "d_media00000000001", false).resource().exists()).isTrue();
    }
}
