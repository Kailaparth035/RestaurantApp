package com.posapp.utils;

import android.util.Log;

import com.posapp.MainActivity;

import java.util.Arrays;

public class HexHelper {

    private static final String TAG = HexHelper.class.getSimpleName();


    /* s must be an even-length string. */
    public static byte[] hexStringToByteArray(String s) {
        int len = s.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4)
                    + Character.digit(s.charAt(i + 1), 16));
        }
        return data;
    }

    public static String hex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte aByte : bytes) {
            result.append(String.format("%02X", aByte));
        }
        return result.toString();
    }

    public static int crc16(final byte[] buffer) {
        /* Note the change here */
        int crc = 0xffff;
        for (int j = 0; j < buffer.length ; j++) {
            crc = ((crc  >>> 8) | (crc  << 8) )& 0xffff;
            crc ^= (buffer[j] & 0xff);//byte to int, trunc sign
            crc ^= ((crc & 0xff) >> 4);
            crc ^= (crc << 12) & 0xffff;
            crc ^= ((crc & 0xFF) << 5) & 0xffff;
        }
        crc &= 0xffff;
        return crc;
    }

    public static String hexStringToAscii(String hexString){
        StringBuilder output = new StringBuilder();
        String trimmedHexString = hexString.substring(0, hexString.length()-4);
        Log.d(TAG, "Trimmed string: "+trimmedHexString);
        for (int i = 0; i < trimmedHexString.length(); i+=2) {
            String str = hexString.substring(i, i+2);
            output.append((char)Integer.parseInt(str, 16));
        }

        String outputFinal = output.toString();
        Log.d(TAG, "output: "+outputFinal);
        if(outputFinal.charAt(output.length()-1) == '.'){
            outputFinal = outputFinal + "0";
        }
        return outputFinal;
    }

    public static byte[] concatenateArrays(byte[] first, byte[] second){
        byte[] both = Arrays.copyOf(first, first.length + second.length);
        System.arraycopy(second, 0, both, first.length, second.length);
        return both;
    }
}