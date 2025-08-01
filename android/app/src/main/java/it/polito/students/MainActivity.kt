package it.polito.students
import expo.modules.ReactActivityDelegateWrapper
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.os.Bundle
import com.zoontek.rnbootsplash.RNBootSplash

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "students"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      ReactActivityDelegateWrapper(this, BuildConfig.IS_NEW_ARCHITECTURE_ENABLED, DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled))


  /**
  * react-native-screens override
  * https://github.com/software-mansion/react-native-screens?tab=readme-ov-file#android
  */
  override fun onCreate(savedInstanceState: Bundle?) {
        RNBootSplash.init(this, R.style.BootTheme);
        super.onCreate(null);
  }
}
