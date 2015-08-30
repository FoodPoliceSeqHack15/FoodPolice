package foodpolice.optimus.com.foodpolice;

import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.widget.LinearLayout;

import com.android.volley.VolleyError;
import com.foodpolice.optimus.parser.DashboardItem;
import com.foodpolice.optimus.parser.DashboardItems;
import com.foodpolice.optimus.parser.RecommendationList;
import com.foodpolice.optimus.utils.Constants;
import com.foodpolice.optimus.utils.NetworkUtil;
import com.google.gson.Gson;

import org.achartengine.ChartFactory;
import org.achartengine.chart.BarChart;
import org.achartengine.model.XYMultipleSeriesDataset;
import org.achartengine.model.XYSeries;
import org.achartengine.renderer.XYMultipleSeriesRenderer;
import org.achartengine.renderer.XYSeriesRenderer;

import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by ps1 on 8/30/15.
 */
public class DashboardActivity extends AppCompatActivity {

    private View mChart;
    private String[] mMonth = new String[] {
            "", "" , "", "", "", "", ""
    };

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.dashboard);

        getDashboardItems();

//        // Getting reference to the button btn_chart
//        Button btnChart = (Button) findViewById(R.id.btn_chart);
//
//        // Defining click event listener for the button btn_chart
//        View.OnClickListener clickListener = new View.OnClickListener() {
//
//            @Override
//            public void onClick(View v) {
//                // Draw the Income vs Expense Chart
//                openChart();
//            }
//        };
//
//        // Setting event click listener for the button btn_chart of the MainActivity layout
//        btnChart.setOnClickListener(clickListener);

    }

    private List<Double> mExpected;// = { 2000,2500,2700,3000,2800,3500,3700};
    private List<Double> mActual;// = {2200, 2700, 2900, 2800, 2600, 3000, 3300};

    private void getDashboardItems() {
        NetworkUtil.getInstance(getApplicationContext()).getData(Constants.DASHBOARD_URL, new NetworkUtil.NetworkUtilCallBacks() {
            @Override
            public void onResponse(String response) {
                final InputStreamReader reader = new InputStreamReader(new ByteArrayInputStream(response.getBytes()));
                final Gson gson = new Gson();
                final DashboardItems items = gson.fromJson(reader, DashboardItems.class);

                if(items != null && items.getExpected() != null && items.getActual() != null) {
                    try {
                        DashboardItem expected = items.getExpected();
                        mExpected = new ArrayList<Double>();
                        mExpected.add(Double.parseDouble(expected.getCalories()));
                        mExpected.add(Double.parseDouble(expected.getCarbohydrates()));
                        mExpected.add(Double.parseDouble(expected.getCholestrol()));
                        mExpected.add(Double.parseDouble(expected.getFiber()));
                        mExpected.add(Double.parseDouble(expected.getProtein()));

                        DashboardItem actual = items.getActual();
                        mActual = new ArrayList<Double>();
                        mActual.add(Double.parseDouble(actual.getCalories()));
                        mActual.add(Double.parseDouble(actual.getCarbohydrates()));
                        mActual.add(Double.parseDouble(actual.getCholestrol()));
                        mActual.add(Double.parseDouble(actual.getFiber()));
                        mActual.add(Double.parseDouble(actual.getProtein()));

                        openChart();
                    } catch(NumberFormatException e) {

                    }
                }
            }

            @Override
            public void onErrorResponse(VolleyError error) {

            }
        });
    }

    private void openChart(){
        // Creating an XYSeries for Income
        XYSeries incomeSeries = new XYSeries("Expected");
        // Creating an XYSeries for Expense
        XYSeries expenseSeries = new XYSeries("Actual");
        // Adding data to Income and Expense Series
        for(int i=0;i< mExpected.size();i++){
            incomeSeries.add(i, mExpected.get(i));
            expenseSeries.add(i, mActual.get(i));
        }

        // Creating a dataset to hold each series
        XYMultipleSeriesDataset dataset = new XYMultipleSeriesDataset();
        // Adding Income Series to the dataset
        dataset.addSeries(incomeSeries);
        // Adding Expense Series to dataset
        dataset.addSeries(expenseSeries);

        // Creating XYSeriesRenderer to customize incomeSeries
        XYSeriesRenderer incomeRenderer = new XYSeriesRenderer();
        incomeRenderer.setColor(getResources().getColor(R.color.bar_graph_standard_color)); //color of the graph set to cyan
        incomeRenderer.setFillPoints(true);
        incomeRenderer.setLineWidth(2);
        incomeRenderer.setDisplayChartValues(true);
        incomeRenderer.setDisplayChartValuesDistance(10); //setting chart value distance

        // Creating XYSeriesRenderer to customize expenseSeries
        XYSeriesRenderer expenseRenderer = new XYSeriesRenderer();
        expenseRenderer.setColor(getResources().getColor(R.color.bar_graph_actual_color));
        expenseRenderer.setFillPoints(true);
        expenseRenderer.setLineWidth(2);
        expenseRenderer.setDisplayChartValues(true);

        // Creating a XYMultipleSeriesRenderer to customize the whole chart
        XYMultipleSeriesRenderer multiRenderer = new XYMultipleSeriesRenderer();
        multiRenderer.setOrientation(XYMultipleSeriesRenderer.Orientation.HORIZONTAL);
        multiRenderer.setXLabels(0);
        multiRenderer.setChartTitle("Expected vs Actual");
        multiRenderer.setXTitle("Year 2015");
        multiRenderer.setYTitle("Calories");

        /***
         * Customizing graphs
         */
//setting text size of the title
        multiRenderer.setChartTitleTextSize(40);
        //setting text size of the axis title
        multiRenderer.setAxisTitleTextSize(36);
        //setting text size of the graph lable
        multiRenderer.setLabelsTextSize(34);
        //setting zoom buttons visiblity
        multiRenderer.setZoomButtonsVisible(true);
        //setting pan enablity which uses graph to move on both axis
        multiRenderer.setPanEnabled(true, true);
        //setting click false on graph
        multiRenderer.setClickEnabled(false);
        //setting zoom to false on both axis
        multiRenderer.setZoomEnabled(true, true);
        //setting lines to display on y axis
        multiRenderer.setShowGridY(false);
        //setting lines to display on x axis
        multiRenderer.setShowGridX(false);
        //setting legend to fit the screen size
        multiRenderer.setFitLegend(true);
        //setting displaying line on grid
        multiRenderer.setShowGrid(false);
        //setting zoom to false
        multiRenderer.setZoomEnabled(true);
        //setting external zoom functions to false
        multiRenderer.setExternalZoomEnabled(true);
        //setting displaying lines on graph to be formatted(like using graphics)
        multiRenderer.setAntialiasing(true);
        //setting to in scroll to false
        multiRenderer.setInScroll(false);
        //setting to set legend height of the graph
        multiRenderer.setLegendHeight(30);
        //setting x axis label align
        multiRenderer.setXLabelsAlign(Paint.Align.CENTER);
        //setting y axis label to align
        multiRenderer.setYLabelsAlign(Paint.Align.LEFT);
        //setting text style
        multiRenderer.setTextTypeface("sans_serif", Typeface.NORMAL);
        //setting no of values to display in y axis
        multiRenderer.setYLabels(10);
        // setting y axis max value, Since i'm using static values inside the graph so i'm setting y max value to 4000.
        // if you use dynamic values then get the max y value and set here
        multiRenderer.setYAxisMax(5000);
        //setting used to move the graph on xaxiz to .5 to the right
        multiRenderer.setXAxisMin(-0.5);
//setting max values to be display in x axis
        multiRenderer.setXAxisMax(4);
        //setting bar size or space between two bars
        multiRenderer.setBarSpacing(0.5);
        //Setting background color of the graph to transparent
        multiRenderer.setBackgroundColor(Color.TRANSPARENT);
        //Setting margin color of the graph to transparent
        multiRenderer.setMarginsColor(getResources().getColor(R.color.transparent_background));
        multiRenderer.setApplyBackgroundColor(true);

        //setting the margin size for the graph in the order top, left, bottom, right
        multiRenderer.setMargins(new int[]{30, 30, 30, 30});

        for(int i=0; i< mExpected.size();i++){
            multiRenderer.addXTextLabel(i, mMonth[i]);
        }

        // Adding incomeRenderer and expenseRenderer to multipleRenderer
        // Note: The order of adding dataseries to dataset and renderers to multipleRenderer
        // should be same
        multiRenderer.addSeriesRenderer(incomeRenderer);
        multiRenderer.addSeriesRenderer(expenseRenderer);

        //this part is used to display graph on the xml
        LinearLayout chartContainer = (LinearLayout) findViewById(R.id.chart);
        //remove any views before u paint the chart
        chartContainer.removeAllViews();
        //drawing bar chart
        mChart = ChartFactory.getBarChartView(DashboardActivity.this, dataset, multiRenderer, BarChart.Type.DEFAULT);
        //adding the view to the linearlayout
        chartContainer.addView(mChart);

    }
}
