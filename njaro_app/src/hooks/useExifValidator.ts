import { useState } from 'react';
import piexif from 'piexifjs';

interface ExifData {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

interface ValidationError {
  code: 'NO_EXIF' | 'OLD_IMAGE' | 'OUTSIDE_AFRICA' | 'UNKNOWN';
  message: string;
}

function dmsToDecimal(dms: number[], ref: string): number {
  const [deg, min, sec] = dms;
  let dec = deg + min / 60 + sec / 3600;
  if (ref === 'S' || ref === 'W') dec = -dec;
  return dec;
}

export const useExifValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<ValidationError | null>(null);

  const validateImage = async (file: File): Promise<ExifData | null> => {
    setIsValidating(true);
    setError(null);
    try {
      // Read file as DataURL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      // Extract EXIF from DataURL
      const exifObj = piexif.load(dataUrl);
      const gps = exifObj['GPS'];
      if (!gps || !gps[piexif.GPSIFD.GPSLatitude] || !gps[piexif.GPSIFD.GPSLongitude]) {
        throw { code: 'NO_EXIF', message: 'No GPS data found in image' };
      }
      // Convert GPS to decimal
      const lat = dmsToDecimal(gps[piexif.GPSIFD.GPSLatitude].map((v: any) => v[0] / v[1]), gps[piexif.GPSIFD.GPSLatitudeRef]);
      const lng = dmsToDecimal(gps[piexif.GPSIFD.GPSLongitude].map((v: any) => v[0] / v[1]), gps[piexif.GPSIFD.GPSLongitudeRef]);
      // Extract timestamp
      let timestamp: Date;
      const dateStr = exifObj['Exif'][piexif.ExifIFD.DateTimeOriginal] || exifObj['0th'][piexif.ImageIFD.DateTime];
      if (dateStr) {
        // Format: "YYYY:MM:DD HH:MM:SS"
        timestamp = new Date(dateStr.replace(/:/g, '-').replace(' ', 'T'));
      } else {
        throw { code: 'NO_EXIF', message: 'No timestamp found in image' };
      }
      // Check if image is older than 24h
      const now = new Date();
      const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
      if (hoursDiff > 24) {
        throw { code: 'OLD_IMAGE', message: 'Image is older than 24 hours' };
      }
      // Check if coordinates are in Africa
      if (lat < -35 || lat > 37.5 || lng < -25 || lng > 50) {
        throw { code: 'OUTSIDE_AFRICA', message: 'Image was not taken in Africa' };
      }
      return { latitude: lat, longitude: lng, timestamp };
    } catch (err: any) {
      setError({
        code: err.code || 'UNKNOWN',
        message: err.message || 'Failed to validate image',
      });
      return null;
    } finally {
      setIsValidating(false);
    }
  };
  return { validateImage, isValidating, error };
};
