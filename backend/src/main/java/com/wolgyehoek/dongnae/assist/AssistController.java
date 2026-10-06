package com.wolgyehoek.dongnae.assist;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "10. 작성 도우미")
@RestController
@RequestMapping("/api/assist")
public class AssistController {

    private final SimilarService similarService;
    private final DraftService draftService;

    public AssistController(SimilarService similarService, DraftService draftService) {
        this.similarService = similarService;
        this.draftService = draftService;
    }

    @PostMapping("/similar")
    public List<SimilarCardResponse> similar(@Valid @RequestBody SimilarRequest request) {
        return similarService.find(request.title(), request.body());
    }

    @PostMapping("/draft")
    public DraftResponse draft(@Valid @RequestBody DraftRequest request) {
        return draftService.draft(request.text());
    }
}