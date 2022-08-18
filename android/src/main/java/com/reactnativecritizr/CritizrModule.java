package com.reactnativecritizr;

import android.os.Build;
import android.text.TextUtils;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;

import org.json.JSONException;
import org.json.JSONObject;

import com.CritizrSDK.CritizrListener;
import com.CritizrSDK.CritizrSDK;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@ReactModule(name = CritizrModule.NAME)
public class CritizrModule extends ReactContextBaseJavaModule implements CritizrListener {
    public static final String NAME = "Critizr";
    public static final String DEBUG_TAG = "CRITIZR_SDK";

    public String language = "en";
    public String user;
    public CritizrSDK critizrSDK;

    // EVENT TYPES
    private static final String EVENT_RATING_RESULT = "EVENT_RATING_RESULT";
    private static final String EVENT_FEEDBACK_SENT = "EVENT_FEEDBACK_SENT";

    // FEEDBACK MODES
    private static final String FEEDBACK_MODE_START_WITH_FEEDBACK = "feedback";
    private static final String FEEDBACK_MODE_START_WITH_QUIZ = "quiz";
    private static final String FEEDBACK_MODE_ONLY_QUIZ = "quizonly";

  public CritizrModule(ReactApplicationContext reactContext) {
      super(reactContext);
    }

    @Override
    public Map<String, Object> getConstants() {
      final Map<String, Object> constants = new HashMap<>();

      constants.put("EVENT_RATING_RESULT", EVENT_RATING_RESULT);
      constants.put("EVENT_FEEDBACK_SENT", EVENT_FEEDBACK_SENT);

      constants.put("FEEDBACK_MODE_START_WITH_FEEDBACK", FEEDBACK_MODE_START_WITH_FEEDBACK);
      constants.put("FEEDBACK_MODE_START_WITH_QUIZ", FEEDBACK_MODE_START_WITH_QUIZ);
      constants.put("FEEDBACK_MODE_ONLY_QUIZ", FEEDBACK_MODE_ONLY_QUIZ);

      return constants;
    }

    @Override
    @NonNull
    public String getName() {
      return NAME;
    }

    @ReactMethod
    public void init(String apiKey, String language) {
      if (language != null) {
        this.language = language;
      }

      this.critizrSDK = CritizrSDK.getInstance(apiKey);
    }

    private void sendEvent(ReactContext reactContext,
                           String eventName,
                           @Nullable WritableMap params) {
      reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit(eventName, params);
    }

    @ReactMethod
    public void setLanguage(String language) {
      this.language = language;
    }

    @ReactMethod
    public void getLanguage(Promise promise) {
      promise.resolve(this.language);
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void setUser(String firstName, String lastName, String email, String phone, String crmId) {
      String[] params = {firstName, lastName, email, phone, crmId};
      String mergedParams = TextUtils.join("|", params);
      String encodeBytes = Base64.getEncoder().encodeToString(mergedParams.getBytes());
      this.user = encodeBytes;
    }

    /**
     * Launches the Feedback Submission Interface in a new activity for the point of sale given by placeId.
     * This activity is linked to a CritizrListener, which will listen for related events.
    **/
    @ReactMethod
    public void openFeedbackDisplay(String mode, Boolean closable, String placeId, @Nullable String tag) {
      JSONObject object = new JSONObject();

      try {
        object.put("mode", mode);
        object.put("closable", closable);
        object.put("lang", this.language);

        if(this.user != null) object.put("user", this.user);

        if(tag != null) object.put("tag", tag);

      } catch (JSONException e) {
        e.printStackTrace();
      }

      if(placeId != null) {
        critizrSDK.openFeedbackActivity(getCurrentActivity(), this, placeId, object);
      } else {
        critizrSDK.openFeedbackActivity(getCurrentActivity(), this, object);
      }
    }

    /**
     * Launches the Store Display interface in a new activity.
     **/
    @ReactMethod
    public void openStoreDisplay(String placeId) {
      JSONObject object = new JSONObject();

      try {
        object.put("lang", this.language);

        if(this.user != null) object.put("user", this.user);

      } catch (JSONException e) {
        e.printStackTrace();
      }

      critizrSDK.openStoreDisplayActivity(getCurrentActivity(), this, placeId, object);
    }

    /**
     * Allows you to retrieve the customer relationship score attributed to a point of sale with ID posId.
     * This method is asynchronous, in that, when the customer relationship score is retrieved,
     * the [onRatingResult] method of the CritizrListener is called.
     **/
    @ReactMethod
    public void requestPlaceRating(String placeId) {
      critizrSDK.getPlaceRating(placeId, this);
    }

    @Override
    public void onFeedbackSent() {
      Log.d(DEBUG_TAG, "Feedback sent!");
      sendEvent(getReactApplicationContext(), this.EVENT_FEEDBACK_SENT, null);
    }

    @Override
    public void onRatingResult(double customerRelationshipRating, double satisfactionRating) {
      Log.d(DEBUG_TAG, "Place Rating customer relationship rating is "+customerRelationshipRating);
      Log.d(DEBUG_TAG, "Place Rating satisfaction rating is "+satisfactionRating);
      WritableMap params = Arguments.createMap();
      params.putString("customerRelationship", Double.toString(customerRelationshipRating));
      params.putString("satisfaction", Double.toString(satisfactionRating));
      sendEvent(getReactApplicationContext(), this.EVENT_RATING_RESULT, params);
    }

    @Override
    public void onRatingError() {
      Log.d(DEBUG_TAG, "Place Rating error!");
      sendEvent(getReactApplicationContext(), this.EVENT_RATING_RESULT, null);
    }
}
