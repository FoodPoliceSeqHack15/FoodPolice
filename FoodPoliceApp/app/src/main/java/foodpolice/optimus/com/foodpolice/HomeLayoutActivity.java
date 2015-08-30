package foodpolice.optimus.com.foodpolice;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;


public class HomeLayoutActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.home_layout);

        findViewById(R.id.take_photo_group).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent cameraIntent = new Intent(HomeLayoutActivity.this, ImageCaptureActivity.class);
                startActivity(cameraIntent);
            }
        });

        findViewById(R.id.get_recommendation).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent recommendationIntent = new Intent(HomeLayoutActivity.this, RecommendationActivity.class);
                startActivity(recommendationIntent);
            }
        });

        findViewById(R.id.dashboard).setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View v) {
                Intent dashboardIntent = new Intent(HomeLayoutActivity.this, DashboardActivity.class);
                startActivity(dashboardIntent);
            }
        });
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_home_layout, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}
