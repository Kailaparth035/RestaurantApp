package com.posapp.utils;

public enum Colors {

    GREEN("green"),
    RED("red");

    private final String name;

    Colors(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
