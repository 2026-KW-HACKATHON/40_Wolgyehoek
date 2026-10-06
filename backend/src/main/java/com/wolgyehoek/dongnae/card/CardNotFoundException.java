package com.wolgyehoek.dongnae.card;

public class CardNotFoundException extends RuntimeException{

    public CardNotFoundException(String id) {
        super("카드를 찾을 수 없어요: " + id);
    }
}
