package com.foodpolice.optimus.parser;

import com.google.gson.annotations.SerializedName;

import java.io.Serializable;

/**
 * Created by ps1 on 8/30/15.
 */
public class DashboardItem implements Serializable{
    @SerializedName("calories")
    private String mCalories;
    @SerializedName("carbohydrates")
    private String mCarbohydrates;
    @SerializedName("cholestrol")
    private String mCholestrol;
    @SerializedName("fiber")
    private String mFiber;
    @SerializedName("protein")
    private String mProtein;

    public DashboardItem(String calories, String carbohydrates, String cholestrol, String fiber, String protein) {
        mCalories = calories;
        mCarbohydrates = carbohydrates;
        mCholestrol = cholestrol;
        mFiber = fiber;
        mProtein = protein;
    }

    public DashboardItem(final DashboardItem expected) {
        mCalories = expected.mCalories;
        mCarbohydrates = expected.mCarbohydrates;
        mCholestrol = expected.mCarbohydrates;
        mFiber = expected.mFiber;
        mProtein = expected.mProtein;
    }

    public String getCalories() {
        return mCalories;
    }

    public String getCarbohydrates() {
        return mCarbohydrates;
    }

    public String getCholestrol() {
        return mCholestrol;
    }

    public String getFiber() {
        return mFiber;
    }

    public String getProtein() {
        return mProtein;
    }
}
