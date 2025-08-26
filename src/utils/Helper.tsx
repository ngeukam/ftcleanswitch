import { jwtDecode } from "jwt-decode";

// Définis le type du payload JWT que tu attends
interface JwtPayload {
  exp: number;
  username?: string;
  email?: string;
  department?: string;
  first_name?: string;
  last_name?: string;
  user_id?: number | string;
  role?: string;
  phone?:string;
  // Ajoute d'autres propriétés personnalisées ici si nécessaire
}

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  if (!token) {
    return false;
  }

  try {
    const decodedToken = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      localStorage.removeItem("token");
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
};

export const getUser = (): JwtPayload | null => {
  const token = localStorage.getItem("token");
  if (!token) {
    return null;
  }

  try {
    const decodedToken = jwtDecode<JwtPayload>(token);
    return decodedToken;
  } catch (err) {
    return null;
  }
};

export const checkIsJson = (str:string) => {
    try {
        JSON.parse(str);
    }
    catch (e) {
        return false;
    }
    return true;
}

export const isValidUrl = (url:string) => {
    try {
        if (Array.isArray(url)) {
            let image = url.filter((item) => item.match(/\.(jpeg|jpg|gif|png)$/) != null);
            if (image.length > 0) {
                new URL(image[0]);
            }
            else {
                if (url.length > 0) {
                    new URL(url[0]);
                }
            }
        }
        else if (checkIsJson(url) && JSON.parse(url).length > 0) {
            let image = JSON.parse(url).filter((item:any) => item.match(/\.(jpeg|jpg|gif|png)$/) != null);
            new URL(image[0]);
        }
        else {
            new URL(url);
        }
        return true;
    }
    catch (e) {
        return false;
    }
}

export const getImageUrl = (url:string) => {
    if (Array.isArray(url)) {
        let image = url.filter((item) => item.match(/\.(jpeg|jpg|gif|png)$/) != null);
        if (image.length > 0) {
            return image[0];
        }
        else {
            if (url.length > 0) {
                return url[0];
            }
            else {
                return url;
            }
        }
    }
    else if (checkIsJson(url) && JSON.parse(url).length > 0) {
        let image = JSON.parse(url).filter((item:any) => item.match(/\.(jpeg|jpg|gif|png)$/) != null);
        return image[0];
    }
    else {
        return url;
    }
}

export const isVideoUrl = (url: string) => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
};