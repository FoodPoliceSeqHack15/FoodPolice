package com.foodpolice.optimus.utils;

import android.content.Context;
import android.util.Log;
import android.widget.Toast;

import com.android.volley.AuthFailureError;
import com.android.volley.DefaultRetryPolicy;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import java.io.File;
import java.util.Map;

import foodpolice.optimus.com.foodpolice.MultipartRequest;
import foodpolice.optimus.com.foodpolice.R;

/**
 * Created by ps1 on 8/29/15.
 */
public class NetworkUtil {
    private static NetworkUtil mInstance;
    private static Context mContext;

    public interface NetworkUtilCallBacks {
        public void onResponse(String response);
        public void onErrorResponse(VolleyError error);
    }

    private void NetworkUtil() {
    }

    public static NetworkUtil getInstance(Context context) {
        if(mInstance == null) {
            mInstance = new NetworkUtil();
            mContext = context;
        }

        return mInstance;
    }

    public void postData(String url, final byte body[], final String contentType, final Map<String, String> headers) {
        StringRequest request = new StringRequest(Request.Method.POST, url, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Log.i("NetworkUtil", "success response");
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.i("NetworkUtil", "error response");
            }
        }) {
            @Override
            public byte[] getBody() throws AuthFailureError {
                if(body != null) {
                    return body;
                } else {
                    return super.getBody();
                }
            }

            @Override
            public String getBodyContentType() {
                if(contentType != null) {
                    return contentType;
                } else {
                    return super.getBodyContentType();
                }
            }

            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {
                if(headers != null) {
                    return headers;
                } else {
                    return super.getHeaders();
                }
            }
        };

        request.setRetryPolicy(new DefaultRetryPolicy() {
            @Override
            public int getCurrentTimeout() {
                return 180000;
            }

            @Override
            public int getCurrentRetryCount() {
                return 0;
            }
        });

        RequestQueue queue = Volley.newRequestQueue(mContext);
        queue.add(request);
    }

    public void postMultipartData(String url, final String fileName, final Map<String, String> headers, final NetworkUtilCallBacks callBacks) {
        MultipartRequest request = new MultipartRequest(url, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
//                Toast.makeText(mContext, R.string.image_upload_error, Toast.LENGTH_LONG).show();
                Toast.makeText(mContext, R.string.image_uploaded, Toast.LENGTH_LONG).show();
                callBacks.onErrorResponse(error);
            }
        }, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Toast.makeText(mContext, R.string.image_uploaded, Toast.LENGTH_LONG).show();
                callBacks.onResponse(response);
            }
        }, new File(fileName), headers);

        RequestQueue queue = Volley.newRequestQueue(mContext);

        queue.add(request);
    }

    public void getData(String url, final NetworkUtilCallBacks callBacks) {
        StringRequest request = new StringRequest(Request.Method.GET, url, new Response.Listener<String>() {

            @Override
            public void onResponse(String response) {
                if(callBacks != null) {
                    callBacks.onResponse(response);
                }
            }
        }, new Response.ErrorListener() {

            @Override
            public void onErrorResponse(VolleyError error) {
                if(callBacks != null) {
                    callBacks.onErrorResponse(error);
                }
            }
        });

        RequestQueue queue = Volley.newRequestQueue(mContext);

        queue.add(request);
    }
}
