package org.valos.isolmoa;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.res.AssetFileDescriptor;
import android.net.Uri;
import android.media.MediaPlayer;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import android.os.Bundle;
import org.valos.isolmoa.R;


public class IsolmoaActivity extends Activity {
    WebView mWebView;

    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // can also add android:theme="@android:style/Theme.NoTitleBar.Fullscreen" to the AndroidManifest.xml
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        //getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, 
        //                     WindowManager.LayoutParams.FLAG_FULLSCREEN);

        setContentView(R.layout.main);

        // http://developer.android.com/reference/android/webkit/WebView.html
        mWebView = (WebView) findViewById(R.id.webview);
        
        mWebView.setWebViewClient(new CustomWebViewClient());
        mWebView.setVerticalScrollBarEnabled(false);

        mWebView.getSettings().setJavaScriptEnabled(true);

        // Increase the priority of the rendering thread to high
        mWebView.getSettings().setRenderPriority(WebSettings.RenderPriority.HIGH);

        // Enable HTML5 local storage and make it persistent
        mWebView.getSettings().setDomStorageEnabled(true);

        // Set viewing area
        //mWebView.getSettings().setUseWideViewPort(true);
        //mWebView.getSettings().setLoadWithOverviewMode(true);

        // Make sure that the webview does not allocate blank space on the side for the scrollbars
        //mWebView.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);

        // Initiate webapp interface 
        mWebView.addJavascriptInterface(new WebAppInterface(this), "Android");

        mWebView.loadUrl("file:///android_asset/www/index.html");
    }

    private class CustomWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            if (i.resolveActivity(getPackageManager()) != null) {
                startActivity(i);
            }
            else {
                Toast.makeText(IsolmoaActivity.this,
                               "You don't have any available app that can handle " + i.getDataString(),
                               Toast.LENGTH_LONG).show();
            }
            return true;
        }
    }

    @Override
    public void onBackPressed() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Isolmoa")
               .setMessage("Are you sure you want to quit ?")
               .setCancelable(false)
               .setPositiveButton("Quit", new DialogInterface.OnClickListener() {
                   public void onClick(DialogInterface dialog, int id) {
                	   IsolmoaActivity.this.finish();
                   }
               })
               .setNegativeButton("Continue to play", new DialogInterface.OnClickListener() {
                   public void onClick(DialogInterface dialog, int id) {
                        dialog.cancel();
                   }
               });
        AlertDialog alert = builder.create();
        alert.show();
    }
}

// http://developer.android.com/guide/webapps/webview.html
class WebAppInterface extends Activity {
    Context mContext;
    private MediaPlayer mp = new MediaPlayer();

    WebAppInterface(Context c) {
        mContext = c;
    }

    @JavascriptInterface
    public void audioplay(String path) {
        try {
            mp.reset();
            AssetFileDescriptor descriptor = mContext.getAssets().openFd("www/" + path);
            mp.setDataSource(descriptor.getFileDescriptor(), descriptor.getStartOffset(), descriptor.getLength());
            descriptor.close();
            mp.prepare();
            mp.start();
            //mp.setVolume(3, 3);
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }
}
