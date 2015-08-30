package com.foodpolice.optimus.parser;

import com.google.gson.annotations.SerializedName;

import java.io.Serializable;

/**
 * Created by ps1 on 8/30/15.
 */
public class DashboardItems implements Serializable{
    @SerializedName("expected")
    private DashboardItem mExpected;

    @SerializedName("actual")
    private DashboardItem mActual;

    public DashboardItems(DashboardItem expected, DashboardItem actual) {
        mExpected = expected;
        mActual = actual;
    }

    public DashboardItems(final DashboardItems items) {
        mExpected = items.mExpected;
        mActual = items.mActual;
    }

    public DashboardItem getExpected() {
        return mExpected;
    }

    public DashboardItem getActual() {
        return mActual;
    }
}
