package foodpolice.optimus.com.foodpolice;

import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TextView;

import com.android.volley.VolleyError;
import com.foodpolice.optimus.parser.RecommendationList;
import com.foodpolice.optimus.utils.Constants;
import com.foodpolice.optimus.utils.NetworkUtil;
import com.google.gson.Gson;

import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.io.StringBufferInputStream;
import java.io.StringReader;


public class RecommendationActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_recommendation);
        getRecommendation();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_recommendation, menu);
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

    private void getRecommendation() {
        NetworkUtil.getInstance(getApplicationContext()).getData(Constants.RECOMMENDATION_URL, new NetworkUtil.NetworkUtilCallBacks() {
            @Override
            public void onResponse(String response) {
//                ((TextView)findViewById(R.id.recommendation_text)).setText(response);
                final InputStreamReader reader = new InputStreamReader(new ByteArrayInputStream(response.getBytes()));
                final Gson gson = new Gson();
                final RecommendationList itemList = gson.fromJson(reader, RecommendationList.class);

                if(itemList != null && itemList.getAdvised() != null && itemList.getAdvised().size() > 0) {
                    for (int i = 0; i < itemList.getAdvised().size(); i++) {
                        Log.i("RecommendationList", "item: " + itemList.getAdvised().get(i));
                    }

                    ArrayAdapter<String> adapter = new ArrayAdapter<String>(getApplicationContext(), R.layout.list_item, itemList.getAdvised());

                    ((ListView) findViewById(R.id.recommdended_list)).setAdapter(adapter);

                }
            }

            @Override
            public void onErrorResponse(VolleyError error) {

            }
        });
    }
}
