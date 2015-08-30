package foodpolice.optimus.com.foodpolice;

import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.support.v7.app.AppCompatActivity;
import android.text.TextUtils;
import android.util.Log;
import android.widget.ProgressBar;
import android.widget.Toast;

import com.android.volley.VolleyError;
import com.foodpolice.optimus.utils.Constants;
import com.foodpolice.optimus.utils.NetworkUtil;

import org.json.JSONObject;

import java.io.File;
import java.io.FileNotFoundException;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by ps1 on 8/29/15.
 */
public class ImageCaptureActivity extends AppCompatActivity {
    public static final int MEDIA_TYPE_IMAGE = 1;
    public static final int MEDIA_TYPE_VIDEO = 2;
    private static final int CAPTURE_IMAGE_ACTIVITY_REQUEST_CODE = 100;
    private static final int CAPTURE_VIDEO_ACTIVITY_REQUEST_CODE = 200;
    private Uri fileUri;
    private ProgressDialog mProgressDialog;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Intent cameraIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);

        fileUri = getOutputMediaFileUri(MEDIA_TYPE_IMAGE); // create a file to save the image
        cameraIntent.putExtra(MediaStore.EXTRA_OUTPUT, fileUri); // set the image file name

        // start the image capture Intent
        startActivityForResult(cameraIntent, CAPTURE_IMAGE_ACTIVITY_REQUEST_CODE);

    }

    /** Create a file Uri for saving an image or video */
    private static Uri getOutputMediaFileUri(int type){
        return Uri.fromFile(getOutputMediaFile(type));
    }

    /** Create a File for saving an image or video */
    private static File getOutputMediaFile(int type){
        // To be safe, you should check that the SDCard is mounted
        // using Environment.getExternalStorageState() before doing this.

        File mediaStorageDir = new File(Environment.getExternalStoragePublicDirectory(
                Environment.DIRECTORY_PICTURES), "FoodPoliceApp");
        // This location works best if you want the created images to be shared
        // between applications and persist after your app has been uninstalled.

        // Create the storage directory if it does not exist
        if (! mediaStorageDir.exists()){
            if (! mediaStorageDir.mkdirs()){
                Log.d("MyCameraApp", "failed to create directory");
                return null;
            }
        }

        // Create a media file name
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        File mediaFile;
        if (type == MEDIA_TYPE_IMAGE){
        mediaFile = new File(mediaStorageDir.getPath() + File.separator +
                "IMG_"+ timeStamp + ".jpg");
        } else if(type == MEDIA_TYPE_VIDEO) {
            mediaFile = new File(mediaStorageDir.getPath() + File.separator +
                    "VID_"+ timeStamp + ".mp4");
        } else {
            return null;
        }

        return mediaFile;
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == CAPTURE_IMAGE_ACTIVITY_REQUEST_CODE) {
            if (resultCode == RESULT_OK) {
                // Image captured and saved to fileUri specified in the Intent
//                Toast.makeText(this, "Image saved to:\n" +
//                        fileUri.toString(), Toast.LENGTH_LONG).show();

                uploadPhotoToServer();
            } else if (resultCode == RESULT_CANCELED) {
                // User cancelled the image capture
            } else {
                // Image capture failed, advise user
            }
        }

        if (requestCode == CAPTURE_VIDEO_ACTIVITY_REQUEST_CODE) {
            if (resultCode == RESULT_OK) {
                // Video captured and saved to fileUri specified in the Intent
                Toast.makeText(this, "Video saved to:\n" +
                        data.getData(), Toast.LENGTH_LONG).show();
            } else if (resultCode == RESULT_CANCELED) {
                // User cancelled the video capture
            } else {
                // Video capture failed, advise user
            }
        }

//        finish();
    }

    private void uploadPhotoToServer() {
        NetworkUtil.getInstance(getApplicationContext()).postMultipartData(Constants.IMAGE_UPLOAD_URL, fileUri.getPath(), null, new NetworkUtil.NetworkUtilCallBacks() {
            @Override
            public void onResponse(String response) {
                mProgressDialog.dismiss();
                if (response != null) {
                    Log.e("NetworkUtil", "message: response" + response);
                    try {
                        JSONObject jsonObject = new JSONObject(response);
                        String food = jsonObject.getString("food");
                        if (!TextUtils.isEmpty(food)) {
//                            Toast.makeText(ImageCaptureActivity.this, "Uploaded Picture of " + food, Toast.LENGTH_LONG).show();
//                            AlertDialog dialog = (new AlertDialog.Builder(ImageCaptureActivity.this)).create();
//                            dialog.setMessage("Uploaded Picture of " + food);
//                            dialog.show();
//                            dialog.setOnDismissListener(new DialogInterface.OnDismissListener() {
//                                @Override
//                                public void onDismiss(DialogInterface dialog) {
//                                    finish();
//                                }
//                            });

                            AlertDialog.Builder db = new AlertDialog.Builder(ImageCaptureActivity.this);
                            db.setTitle("Add to your Food Log:");
                            db.setMessage(food);
                            db.setPositiveButton("OK", new
                                    DialogInterface.OnClickListener() {
                                        public void onClick(DialogInterface dialog, int which) {
                                            finish();
                                        }
                                    });

                            AlertDialog dialog = db.show();
                        } else {
                            Log.e("NetworkUtil", "message: data empty");
                            Toast.makeText(ImageCaptureActivity.this, R.string.image_uploaded, Toast.LENGTH_LONG).show();
                            finish();
                        }
                    } catch(Exception e) {
                        Log.e("NetworkUtil", "message: caught exception");
                        finish();
                    }
                }
            }

            @Override
            public void onErrorResponse(VolleyError error) {
                mProgressDialog.dismiss();
                finish();
            }
        });
        mProgressDialog = new ProgressDialog(this);
        mProgressDialog.setMessage("Uploading Image...");
        mProgressDialog.show();
    }
}
