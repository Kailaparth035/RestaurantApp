package com.posapp.anycommerce;

import android.app.Activity;
import android.content.pm.PackageManager;
import android.os.Build;
import android.Manifest;

import androidx.core.app.ActivityCompat;

import java.util.ArrayList;

public class ACPermissionsController {

    /**
     * Permissions
     */
    public static String[] permissions = {
//            Manifest.permission.READ_PHONE_STATE,
//            Manifest.permission.CAMERA,
//            Manifest.permission.ACCESS_COARSE_LOCATION,
//            Manifest.permission.WRITE_EXTERNAL_STORAGE,
//            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            //Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.BLUETOOTH
    };

    public static String[] advPermissions = {
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.BLUETOOTH_SCAN,
            Manifest.permission.BLUETOOTH,
    };


    public static ArrayList<String> grantedPermissions = new ArrayList<String>();

    public static boolean verifyAppPermissions(Activity activity) {

        grantedPermissions.clear();
        boolean hasNecessaryPermissions = true;

        if (Build.VERSION.SDK_INT > Build.VERSION_CODES.LOLLIPOP_MR1 && activity != null && permissions != null) {
            for (String permission : Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ? advPermissions : permissions) {
                if (ActivityCompat.checkSelfPermission(activity, permission) != PackageManager.PERMISSION_GRANTED) {
                    hasNecessaryPermissions = false;
                } else {
                    grantedPermissions.add(permission);
                }

            }

        }
        return hasNecessaryPermissions;
    }

    public static boolean verifyAppPermission(Activity activity, String permission) {
        // Check for device permission
        if (ActivityCompat.checkSelfPermission(activity, permission) != PackageManager.PERMISSION_GRANTED) {
            return false;
        }

        return true;
    }

    public static void requestAppPermissions(Activity activity, String s, int reqCode) {
        ActivityCompat.requestPermissions(activity, new String[]{s}, reqCode);
    }

    public static void requestAppPermissions(Activity activity, String[] s, int reqCode) {
        ActivityCompat.requestPermissions(activity, s, reqCode);
    }
}