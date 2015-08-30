package com.foodpolice.optimus.parser;

import com.google.gson.annotations.SerializedName;

import java.io.Serializable;
import java.util.List;

/**
 * Created by ps1 on 8/30/15.
 */
public class RecommendationList implements Serializable{
    @SerializedName("advised")
    private final List<String> mAdvised;

    public RecommendationList(List<String> advised) {
        mAdvised = advised;
    }

    public RecommendationList(final RecommendationList recommendationList) {
        mAdvised = recommendationList.mAdvised;
    }

    public List<String> getAdvised() {
        return mAdvised;
    }
}
