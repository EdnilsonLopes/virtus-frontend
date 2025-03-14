export class AuthUtils
{
    constructor()
    {
    }

    static isTokenExpired(token: string, offsetSeconds?: number): boolean
    {
        
        if ( !token || token === '' )
        {
            return true;
        }

        
        const date = this._getTokenExpirationDate(token);

        offsetSeconds = offsetSeconds || 0;

        if ( date === null )
        {
            return true;
        }

        return !(date.valueOf() > new Date().valueOf() + offsetSeconds * 1000);
    }

    private static _b64decode(str: string): string
    {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let output = '';

        str = String(str).replace(/=+$/, '');

        if ( str.length % 4 === 1 )
        {
            throw new Error(
                '\'atob\' failed: The string to be decoded is not correctly encoded.'
            );
        }

        for (
            
            let bc = 0, bs: any, buffer: any, idx = 0;
            
            (buffer = str.charAt(idx++));
            
            ~buffer &&
            (
                (bs = bc % 4 ? bs * 64 + buffer : buffer),
                bc++ % 4
            )
                ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
                : 0
        )
        {
            buffer = chars.indexOf(buffer);
        }

        return output;
    }

    private static _b64DecodeUnicode(str: any): string
    {
        return decodeURIComponent(
            Array.prototype.map
                 .call(this._b64decode(str), (c: any) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                 .join('')
        );
    }

    
    private static _urlBase64Decode(str: string): string
    {
        let output = str.replace(/-/g, '+').replace(/_/g, '/');
        switch ( output.length % 4 )
        {
            case 0:
            {
                break;
            }
            case 2:
            {
                output += '==';
                break;
            }
            case 3:
            {
                output += '=';
                break;
            }
            default:
            {
                throw Error('Illegal base64url string!');
            }
        }
        return this._b64DecodeUnicode(output);
    }

    private static _decodeToken(token: string): any
    {
        if ( !token )
        {
            return null;
        }

        const parts = token.split('.');

        if ( parts.length !== 3 )
        {
            throw new Error('O token inspecionado não parece ser um JWT. Verifique se ele tem três partes e consulte https://jwt.io para obter mais informações.');
        }

        const decoded = this._urlBase64Decode(parts[1]);

        if ( !decoded )
        {
            throw new Error('Não é possível decodificar o token.');
        }

        return JSON.parse(decoded);
    }

    private static _getTokenExpirationDate(token: string): Date | null
    {

        const decodedToken = this._decodeToken(token);

        if ( !decodedToken.hasOwnProperty('exp') )
        {
            return null;
        }

        const date = new Date(0);
        date.setUTCSeconds(decodedToken.exp);
        return date;
    }
}
