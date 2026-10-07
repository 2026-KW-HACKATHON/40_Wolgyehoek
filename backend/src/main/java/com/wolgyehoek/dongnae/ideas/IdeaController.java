package com.wolgyehoek.dongnae.ideas;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;

@Tag(name = "11. 아이디어 지도")
@RestController
@RequestMapping("/api/ideas")
public class IdeaController {

    public record CheckRequest(@NotBlank(message = "제목을 적어 주세요.") String title,
                               String problem, String body, String place, String topic) {
    }

    private final IdeaGraphService graph;

    public IdeaController(IdeaGraphService graph) {
        this.graph = graph;
    }

    @PostMapping("/check")
    public IdeaGraphService.Check check(@Valid @RequestBody CheckRequest r) {
        return graph.check(r.title(), r.problem(), r.body(), r.place(), r.topic());
    }

    @GetMapping("/map")
    public IdeaGraphService.IdeaMap map() {
        return graph.map();
    }

    @GetMapping("/{id}/related")
    public IdeaGraphService.Check related(@PathVariable String id) {
        return graph.related(id);
    }
}
