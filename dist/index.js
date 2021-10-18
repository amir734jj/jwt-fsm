var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import JwtDecode from "jwt-decode";
import * as moment from 'moment';
import * as winston from "winston";
import * as _ from 'lodash';
var JwtFsm = /** @class */ (function () {
    function JwtFsm(options) {
        this._options = _.extend({}, options, {
            renewal: 5,
            logger: winston.createLogger({
                format: winston.format.json(),
                level: 'info',
                defaultMeta: { service: 'jwt-fsm-service' },
            }),
        });
        this.init();
    }
    JwtFsm.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.recoverToken()];
                    case 1:
                        _a.sent();
                        this.scheduleRenewal();
                        return [2 /*return*/];
                }
            });
        });
    };
    JwtFsm.prototype.recoverToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._options.recover()];
                    case 1:
                        token = _a.sent();
                        if (token && !JwtFsm.validate(this._token)) {
                            this._options.logger.error("recoverToken: Token is not valid.");
                        }
                        this._token = token;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Static function that validate token
     * @param token
     * @private
     */
    JwtFsm.validate = function (token) {
        return moment.duration(moment(JwtFsm.tokenExpires(token))
            .diff(moment()))
            .asMilliseconds() > 0;
    };
    /**
     * Manually sets the token
     * @param token
     */
    JwtFsm.prototype.setToken = function (token) {
        if (!token || !JwtFsm.validate(token)) {
            this._options.logger.error("setToken: Token is not valid.");
            throw new Error("Token is not valid.");
        }
        this._token = token;
        clearTimeout(this._renewalTimer);
        this.scheduleRenewal();
    };
    /**
     * Returns the token value
     * @private
     */
    JwtFsm.prototype.token = function () {
        if (this._token && !JwtFsm.validate(this._token)) {
            this._options.logger.error("Token is not valid.");
        }
        return this._token;
    };
    /**
     * Utility function that schedules renewal of JWT token
     * @private
     */
    JwtFsm.prototype.scheduleRenewal = function () {
        var _this = this;
        var renewal = moment.duration(moment(JwtFsm.tokenExpires(this.token()))
            .diff(moment()))
            .subtract(this._options.renewal, 'minutes')
            .asMilliseconds();
        this._renewalTimer = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this._options.renew()];
                    case 1:
                        _a._token = _b.sent();
                        this.scheduleRenewal();
                        return [2 /*return*/];
                }
            });
        }); }, renewal);
    };
    /**
     * Utility function that returns the Date object of when token expires
     * @return Date object of when token expires
     * @private
     */
    JwtFsm.tokenExpires = function (token) {
        var exp = JwtDecode(token).exp;
        return new Date(exp * 1000);
    };
    return JwtFsm;
}());
export { JwtFsm };
