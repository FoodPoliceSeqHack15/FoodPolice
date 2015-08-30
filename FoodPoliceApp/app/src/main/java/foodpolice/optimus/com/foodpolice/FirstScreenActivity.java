package foodpolice.optimus.com.foodpolice;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.Window;

/**
 * Created by ps1 on 8/30/15.
 */
public class FirstScreenActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        super.onCreate(savedInstanceState);
        setContentView(R.layout.first_layout);

        findViewById(R.id.first_item).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                startActivity(new Intent(FirstScreenActivity.this, HomeLayoutActivity.class));
                finish();
            }
        });
    }
}
