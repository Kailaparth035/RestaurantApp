package com.posapp.utils;

import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.os.Bundle;

import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.DialogFragment;

import com.posapp.MainActivity;

public class PosPermissionDialog extends DialogFragment {
    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
        builder.setMessage("You need to grant access to PosApp in both prompt for the application to function properly" +
                "\n\n Please exit and restart the application")
                .setPositiveButton("Continue", (dialog, id) -> {

                });
        return builder.create();
    }
}