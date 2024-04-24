var Io = Object.defineProperty;
var ro = (e, t, A) => t in e ? Io(e, t, { enumerable: !0, configurable: !0, writable: !0, value: A }) : e[t] = A;
var O = (e, t, A) => (ro(e, typeof t != "symbol" ? t + "" : t, A), A);
import rA from "node:path";
import qe, { promises as Vt } from "node:fs";
import Pe from "node:os";
import { D as Eo, a as Qo, G as oo } from "../DUaKd8HF/index.js";
import vA from "path";
import Bt from "util";
import Ut from "events";
import Vn from "child_process";
import tE from "os";
import nA from "fs";
import ao from "stream";
import so from "fs/promises";
import Co, { randomUUID as Tn } from "crypto";
import * as co from "node:crypto";
import { M as iB, G as iE, P as BE, L as fo, S as uo, B as xo } from "../CUkzVuc1/index.js";
import { EventEmitter as ho } from "node:events";
import lo from "url";
import wo from "net";
import { spawn as yo } from "node:child_process";
import BB from "buffer";
import { Buffer as Ae } from "node:buffer";
import "../Cw4M1rBn/index.js";
function Do(e, t) {
  for (var A = 0; A < t.length; A++) {
    const i = t[A];
    if (typeof i != "string" && !Array.isArray(i)) {
      for (const B in i)
        if (B !== "default" && !(B in e)) {
          const g = Object.getOwnPropertyDescriptor(i, B);
          g && Object.defineProperty(e, B, g.get ? g : {
            enumerable: !0,
            get: () => i[B]
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }));
}
const po = Pe.platform(), Og = Pe.release(), gE = Pe.hostname(), mo = Pe.homedir();
rA.join(mo, "Downloads");
const mI = Pe.type(), nE = process.execPath, Go = rA.join(rA.dirname(nE), "resources", "app", "package.json");
let mt;
if (Pe.platform() !== "linux")
  mt = rA.join(rA.dirname(nE), "resources", "app", "versions", "config.json");
else {
  const e = Pe.homedir(), t = rA.resolve(e, "./.config/QQ");
  mt = rA.resolve(t, "./versions/config.json");
}
if (typeof mt != "string")
  throw new Error("Something went wrong when load QQ info path");
let _g = {
  baseVersion: "9.9.9-22578",
  curVersion: "9.9.9-22578",
  prevVersion: "",
  onErrorVersions: [],
  buildId: "22578"
};
if (qe.existsSync(mt))
  try {
    const e = JSON.parse(qe.readFileSync(mt).toString());
    _g = Object.assign(_g, e);
  } catch (e) {
    console.error("Load QQ version config info failed, Use default version", e);
  }
const ot = _g, Fo = require(Go);
let IE = "537213335";
po === "linux" && (IE = "537213710");
const rE = IE, et = ee;
(function(e, t) {
  const A = ee, i = e();
  for (; ; )
    try {
      if (parseInt(A(135)) / 1 + parseInt(A(145)) / 2 * (-parseInt(A(132)) / 3) + -parseInt(A(128)) / 4 + parseInt(A(125)) / 5 + parseInt(A(122)) / 6 * (parseInt(A(137)) / 7) + -parseInt(A(133)) / 8 * (-parseInt(A(144)) / 9) + -parseInt(A(123)) / 10 === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(Ii, 763172);
const Ro = function() {
  const e = ee, t = {};
  t[e(129)] = "AdIcy";
  const A = t;
  let i = !0;
  return function(B, g) {
    const n = e, I = {};
    I[n(126)] = A[n(129)];
    const r = I, a = i ? function() {
      const Q = n;
      if (r[Q(126)] !== "pbvrn") {
        if (g) {
          const E = g.apply(B, arguments);
          return g = null, E;
        }
      } else if (_0x2288ed) {
        const E = _0x49bdd1[Q(142)](_0x3d47f2, arguments);
        return _0x4d3432 = null, E;
      }
    } : function() {
    };
    return i = !1, a;
  };
}(), jg = Ro(void 0, function() {
  const e = ee, t = {};
  t[e(121)] = e(139);
  const A = t;
  return jg.toString()[e(131)](A[e(121)])[e(134)]()[e(127)](jg)[e(131)](e(139));
});
jg();
function Ii() {
  const e = ["EfDsCfu", "nNLnzLzcEq", "mtG4mJu5ndb2z3fpEMS", "lI9YzxnVDxjJzxmVyxbWl3DYyxbWzxiUBM9Kzq", "mta0mtm2nuTou0PiDW", "ugXfzgK", "y29UC3rYDwn0B3i", "mZi0mJq4mgnRq1DnDG", "v01ZBKW", "zxHPC3rZu3LUyW", "C2vHCMnO", "mZeZndm3EvzdzNP4", "mtu5otjjCLrhAum", "Dg9tDhjPBMC", "mti0nZy4mu9fC3vMsG", "AM9PBG", "mta0ndmXmtHotxH3r2y", "l3DYyxbWzxiUBM9Kzq", "kcGOlISPkYKRksSK", "y3vYvMvYC2LVBG", "CMvZB3vYy2vZl2fWCc92zxjZAw9UCY8", "yxbWBhK", "zxHLy1bHDgG", "nteXmLPxrfDbra", "mtj1ru9oAfO"];
  return Ii = function() {
    return e;
  }, Ii();
}
let $g = rA.resolve(rA.dirname(process[et(143)]), et(124));
!qe[et(130)]($g) && ($g = rA[et(136)](rA.dirname(process.execPath), et(141) + ot[et(140)] + et(138)));
function ee(e, t) {
  const A = Ii();
  return ee = function(i, B) {
    i = i - 121;
    let g = A[i];
    if (ee.PVbFnB === void 0) {
      var n = function(Q) {
        const E = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
        let o = "", c = "", l = o + n;
        for (let u = 0, C, s, f = 0; s = Q.charAt(f++); ~s && (C = u % 4 ? C * 64 + s : s, u++ % 4) ? o += l.charCodeAt(f + 10) - 10 !== 0 ? String.fromCharCode(255 & C >> (-2 * u & 6)) : u : 0)
          s = E.indexOf(s);
        for (let u = 0, C = o.length; u < C; u++)
          c += "%" + ("00" + o.charCodeAt(u).toString(16)).slice(-2);
        return decodeURIComponent(c);
      };
      ee.ZwFIci = n, e = arguments, ee.PVbFnB = !0;
    }
    const I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      const Q = function(E) {
        this.xnyOda = E, this.VpQOlV = [1, 0, 0], this.EYdpnB = function() {
          return "newState";
        }, this.Cmgfzh = "\\w+ *\\(\\) *{\\w+ *", this.zuCGvO = `['|"].+['|"];? *}`;
      };
      Q.prototype.gcjhIv = function() {
        const E = new RegExp(this.Cmgfzh + this.zuCGvO), o = E.test(this.EYdpnB.toString()) ? --this.VpQOlV[1] : --this.VpQOlV[0];
        return this.TykoIp(o);
      }, Q.prototype.TykoIp = function(E) {
        return ~E ? this.NZcvmK(this.xnyOda) : E;
      }, Q.prototype.NZcvmK = function(E) {
        for (let o = 0, c = this.VpQOlV.length; o < c; o++)
          this.VpQOlV.push(Math.round(Math.random())), c = this.VpQOlV.length;
        return E(this.VpQOlV[0]);
      }, new Q(ee).gcjhIv(), g = ee.ZwFIci(g), e[r] = g;
    }
    return g;
  }, ee(e, t);
}
const CA = require($g), cu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CA
}, Symbol.toStringTag, { value: "Module" }));
(function(e, t) {
  for (var A = he, i = e(); ; )
    try {
      var B = -parseInt(A(187)) / 1 * (parseInt(A(188)) / 2) + parseInt(A(184)) / 3 + -parseInt(A(179)) / 4 * (parseInt(A(177)) / 5) + parseInt(A(175)) / 6 + -parseInt(A(172)) / 7 + -parseInt(A(186)) / 8 + parseInt(A(190)) / 9;
      if (B === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(ri, 680153);
var So = /* @__PURE__ */ function() {
  var e = !0;
  return function(t, A) {
    var i = e ? function() {
      if (A) {
        var B = A.apply(t, arguments);
        return A = null, B;
      }
    } : function() {
    };
    return e = !1, i;
  };
}(), An = So(void 0, function() {
  var e = he, t = {};
  t.gczPS = "(((.+)+)+)+$";
  var A = t;
  return An[e(189)]()[e(176)](e(174))[e(189)]()[e(182)](An)[e(176)](A[e(191)]);
});
function he(e, t) {
  var A = ri();
  return he = function(i, B) {
    i = i - 172;
    var g = A[i];
    if (he.rQNHOA === void 0) {
      var n = function(E) {
        for (var o = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=", c = "", l = "", u = c + n, C = 0, s, f, h = 0; f = E.charAt(h++); ~f && (s = C % 4 ? s * 64 + f : f, C++ % 4) ? c += u.charCodeAt(h + 10) - 10 !== 0 ? String.fromCharCode(255 & s >> (-2 * C & 6)) : C : 0)
          f = o.indexOf(f);
        for (var x = 0, d = c.length; x < d; x++)
          l += "%" + ("00" + c.charCodeAt(x).toString(16)).slice(-2);
        return decodeURIComponent(l);
      };
      he.yHDDRV = n, e = arguments, he.rQNHOA = !0;
    }
    var I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      var Q = function(E) {
        this.TdgyIg = E, this.zToyPn = [1, 0, 0], this.BAPtai = function() {
          return "newState";
        }, this.ybcraX = "\\w+ *\\(\\) *{\\w+ *", this.Tcqzmq = `['|"].+['|"];? *}`;
      };
      Q.prototype.QhPMOA = function() {
        var E = new RegExp(this.ybcraX + this.Tcqzmq), o = E.test(this.BAPtai.toString()) ? --this.zToyPn[1] : --this.zToyPn[0];
        return this.OTPxod(o);
      }, Q.prototype.OTPxod = function(E) {
        return ~E ? this.hfykVt(this.TdgyIg) : E;
      }, Q.prototype.hfykVt = function(E) {
        for (var o = 0, c = this.zToyPn.length; o < c; o++)
          this.zToyPn.push(Math.round(Math.random())), c = this.zToyPn.length;
        return E(this.zToyPn[0]);
      }, new Q(he).QhPMOA(), g = he.yHDDRV(g), e[r] = g;
    }
    return g;
  }, he(e, t);
}
function ri() {
  var e = ["mJGXmtKWvK1msK1y", "tLDTEwS", "nZeYode3nNDevuPozq", "nta5mdiZyMzOtwXb", "mMriEencCW", "Dg9tDhjPBMC", "mJuXnZy2ndvvrgjrqNG", "z2n6ufm", "mZG5mZCXnur4wKnqrG", "BxriBee", "kcGOlISPkYKRksSK", "mZK5ndC3mgHnwvn6tq", "C2vHCMnO", "mtuZnde0nxPcAhDSzq", "Dw5RBM93BG", "mtjLv3b2wgy", "rhrUC08", "zMvTywXL", "y29UC3rYDwn0B3i", "BwfSzq"];
  return ri = function() {
    return e;
  }, ri();
}
An();
var EE = ((e) => {
  var t = he, A = {};
  A[t(180)] = t(183), A[t(185)] = "female", A[t(173)] = t(178);
  var i = A;
  return e[e[i[t(180)]] = 1] = i.DtnsO, e[e[t(181)] = 2] = i[t(185)], e[e[i[t(173)]] = 255] = t(178), e;
})(EE || {});
(function(e, t) {
  for (var A = te, i = e(); ; )
    try {
      var B = parseInt(A(518)) / 1 + parseInt(A(498)) / 2 * (parseInt(A(502)) / 3) + parseInt(A(497)) / 4 * (parseInt(A(514)) / 5) + -parseInt(A(504)) / 6 * (-parseInt(A(521)) / 7) + -parseInt(A(508)) / 8 * (parseInt(A(495)) / 9) + parseInt(A(522)) / 10 + parseInt(A(513)) / 11 * (-parseInt(A(499)) / 12);
      if (B === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(Ei, 535056);
var bo = function() {
  var e = te, t = {};
  t[e(509)] = e(507), t[e(512)] = e(496), t[e(500)] = "owner", t[e(517)] = e(510);
  var A = t, i = !0;
  return function(B, g) {
    var n = e, I = {};
    I[n(506)] = A[n(509)], I[n(505)] = A.hzpqL, I.dauOD = A[n(500)];
    var r = I;
    if (A.aZuXI !== A[n(517)])
      return _0x4cb33d[_0x49469a[r[n(506)]] = 2] = r[n(506)], _0x7153c3[_0x29bae3[r[n(505)]] = 3] = r[n(505)], _0x24ff84[_0x532423[r.dauOD] = 4] = r.dauOD, _0x3d4280;
    var a = i ? function() {
      if (g) {
        var Q = g.apply(B, arguments);
        return g = null, Q;
      }
    } : function() {
    };
    return i = !1, a;
  };
}(), en = bo(void 0, function() {
  var e = te, t = {};
  t.TtbRD = e(516);
  var A = t;
  return en[e(501)]()[e(523)](A[e(524)])[e(501)]()[e(511)](en).search(A[e(524)]);
});
en();
var QE = ((e) => {
  var t = te, A = {};
  A[t(503)] = t(507), A[t(520)] = "admin", A[t(515)] = "owner";
  var i = A;
  return e[e[i[t(503)]] = 2] = i[t(503)], e[e[i.FLAob] = 3] = i.FLAob, e[e[i[t(515)]] = 4] = t(519), e;
})(QE || {});
function te(e, t) {
  var A = Ei();
  return te = function(i, B) {
    i = i - 495;
    var g = A[i];
    if (te.CtCEfx === void 0) {
      var n = function(E) {
        for (var o = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=", c = "", l = "", u = c + n, C = 0, s, f, h = 0; f = E.charAt(h++); ~f && (s = C % 4 ? s * 64 + f : f, C++ % 4) ? c += u.charCodeAt(h + 10) - 10 !== 0 ? String.fromCharCode(255 & s >> (-2 * C & 6)) : C : 0)
          f = o.indexOf(f);
        for (var x = 0, d = c.length; x < d; x++)
          l += "%" + ("00" + c.charCodeAt(x).toString(16)).slice(-2);
        return decodeURIComponent(l);
      };
      te.cbfyMU = n, e = arguments, te.CtCEfx = !0;
    }
    var I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      var Q = function(E) {
        this.xynjHE = E, this.TGTCoP = [1, 0, 0], this.MXaKFh = function() {
          return "newState";
        }, this.OfGoKd = "\\w+ *\\(\\) *{\\w+ *", this.gHeFSQ = `['|"].+['|"];? *}`;
      };
      Q.prototype.ETFprk = function() {
        var E = new RegExp(this.OfGoKd + this.gHeFSQ), o = E.test(this.MXaKFh.toString()) ? --this.TGTCoP[1] : --this.TGTCoP[0];
        return this.UJJfvF(o);
      }, Q.prototype.UJJfvF = function(E) {
        return ~E ? this.AhttIJ(this.xynjHE) : E;
      }, Q.prototype.AhttIJ = function(E) {
        for (var o = 0, c = this.TGTCoP.length; o < c; o++)
          this.TGTCoP.push(Math.round(Math.random())), c = this.TGTCoP.length;
        return E(this.TGTCoP[0]);
      }, new Q(te).ETFprk(), g = te.cbfyMU(g), e[r] = g;
    }
    return g;
  }, te(e, t);
}
function Ei() {
  var e = ["nJKXmdeWA29Zvwn1", "B3DUzxi", "rKXbB2i", "n0X6q1PPrq", "otyZmJCYmfLOt09rvW", "C2vHCMnO", "vhrIuKq", "mZaYmda1og1Vz2jHEG", "ywrTAw4", "mZCYmtjuvfjnwwG", "ntrXywL0Efm", "mtaXnta4ExriA1DY", "s3fiuwq", "Dg9tDhjPBMC", "mJK4ntLfDwr3Bxa", "ufjMBgC", "nty5mZa0nKHMDeXfwG", "wMfAzfq", "zgXnsfu", "BM9YBwfS", "mtzvDwXLr3C", "vu1rDfq", "BfPTzwS", "y29UC3rYDwn0B3i", "AhPWCuW", "mJC4m1rhAKvOqG", "mJu1wNPXvuvR", "tw1ouvq", "kcGOlISPkYKRksSK", "yvP1weK"];
  return Ei = function() {
    return e;
  }, Ei();
}
var vt = hA;
(function(e, t) {
  for (var A = hA, i = e(); ; )
    try {
      var B = -parseInt(A(267)) / 1 * (-parseInt(A(237)) / 2) + parseInt(A(282)) / 3 * (parseInt(A(289)) / 4) + -parseInt(A(230)) / 5 * (-parseInt(A(286)) / 6) + -parseInt(A(248)) / 7 + parseInt(A(238)) / 8 * (parseInt(A(275)) / 9) + -parseInt(A(246)) / 10 + parseInt(A(235)) / 11;
      if (B === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(oi, 526194);
var No = /* @__PURE__ */ function() {
  var e = !0;
  return function(t, A) {
    var i = e ? function() {
      var B = hA;
      if (A) {
        var g = A[B(258)](t, arguments);
        return A = null, g;
      }
    } : function() {
    };
    return e = !1, i;
  };
}(), tn = No(void 0, function() {
  var e = hA, t = {};
  t.RyUOA = "(((.+)+)+)+$";
  var A = t;
  return tn.toString()[e(273)](A[e(293)])[e(284)]()[e(285)](tn)[e(273)](A[e(293)]);
});
tn();
var oA = ((e) => {
  var t = hA, A = {};
  A[t(229)] = t(291), A[t(234)] = t(259), A.wMMjY = t(270), A[t(240)] = t(264), A[t(227)] = t(250), A[t(292)] = t(260), A[t(263)] = t(274), A.DilYw = t(243), A[t(226)] = "MARKDOWN";
  var i = A;
  return e[e[t(291)] = 1] = i[t(229)], e[e[i.rlLol] = 2] = i.rlLol, e[e[i.wMMjY] = 3] = i[t(251)], e[e[i.gblpc] = 4] = i[t(240)], e[e[i[t(227)]] = 5] = "VIDEO", e[e[i.DfIHC] = 6] = i.DfIHC, e[e[t(274)] = 7] = i[t(263)], e[e[i.DilYw] = 10] = i[t(247)], e[e[t(253)] = 14] = i[t(226)], e;
})(oA || {}), Qi = ((e) => {
  var t = hA, A = {};
  A[t(279)] = t(252), A[t(242)] = t(276);
  var i = A;
  return e[e[t(252)] = 2e3] = i[t(279)], e[e[i[t(242)]] = 1e3] = i[t(242)], e;
})(Qi || {}), oE = ((e) => {
  var t = hA, A = {};
  A[t(249)] = "normal", A[t(254)] = t(236);
  var i = A;
  return e[e[i[t(249)]] = 0] = i[t(249)], e[e[i.vxQBB] = 1] = t(236), e;
})(oE || {});
function hA(e, t) {
  var A = oi();
  return hA = function(i, B) {
    i = i - 226;
    var g = A[i];
    if (hA.EepwqD === void 0) {
      var n = function(E) {
        for (var o = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=", c = "", l = "", u = c + n, C = 0, s, f, h = 0; f = E.charAt(h++); ~f && (s = C % 4 ? s * 64 + f : f, C++ % 4) ? c += u.charCodeAt(h + 10) - 10 !== 0 ? String.fromCharCode(255 & s >> (-2 * C & 6)) : C : 0)
          f = o.indexOf(f);
        for (var x = 0, d = c.length; x < d; x++)
          l += "%" + ("00" + c.charCodeAt(x).toString(16)).slice(-2);
        return decodeURIComponent(l);
      };
      hA.YgHKCI = n, e = arguments, hA.EepwqD = !0;
    }
    var I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      var Q = function(E) {
        this.dOFaCp = E, this.vHeJRd = [1, 0, 0], this.gDXhBL = function() {
          return "newState";
        }, this.gzuvUm = "\\w+ *\\(\\) *{\\w+ *", this.VgEuik = `['|"].+['|"];? *}`;
      };
      Q.prototype.KJmgfQ = function() {
        var E = new RegExp(this.gzuvUm + this.VgEuik), o = E.test(this.gDXhBL.toString()) ? --this.vHeJRd[1] : --this.vHeJRd[0];
        return this.jbPKvt(o);
      }, Q.prototype.jbPKvt = function(E) {
        return ~E ? this.RiRJtr(this.dOFaCp) : E;
      }, Q.prototype.RiRJtr = function(E) {
        for (var o = 0, c = this.vHeJRd.length; o < c; o++)
          this.vHeJRd.push(Math.round(Math.random())), c = this.vHeJRd.length;
        return E(this.vHeJRd[0]);
      }, new Q(hA).KJmgfQ(), g = hA.YgHKCI(g), e[r] = g;
    }
    return g;
  }, hA(e, t);
}
var Pn = ((e) => {
  var t = hA, A = {};
  A[t(283)] = t(281), A.nEEUp = "atUser";
  var i = A;
  return e[e[i[t(283)]] = 0] = i[t(283)], e[e[t(265)] = 1] = "atAll", e[e[i[t(256)]] = 2] = t(280), e;
})(Pn || {}), aE = ((e) => {
  var t = hA, A = {};
  A[t(244)] = t(287), A.hJXvp = t(257), A[t(233)] = "temp";
  var i = A;
  return e[e[i[t(244)]] = 1] = i.EAbEY, e[e[i[t(245)]] = 2] = i[t(245)], e[e[i[t(233)]] = 100] = i[t(233)], e;
})(aE || {});
const Uo = vt(288), vo = "https://multimedia.nt.qq.com.cn";
function oi() {
  var e = ["zuPduLy", "su5wsvrfx05fv19nru1crvi", "DgfdDuK", "CMXmB2W", "mte5nZm0nJDnBMTRwMm", "zMfJzq", "mtG0nZm4zNzdA1fk", "mtyWognwBgvIsa", "A0fNBuO", "z2jSCgm", "y0nLsNq", "tM9qrNq", "qvjl", "rufIrvK", "AePyDNa", "ntK1mZG1meLuChr2Da", "rgLSwxC", "ntu2mdG4nhzhz3fzBa", "r25xwvm", "vKLeru8", "D01nALK", "z2LM", "tufss0rpv04", "DNHrqKi", "uLbt", "BKvfvxa", "z3jVDxa", "yxbWBhK", "ueLd", "rKfdrq", "ruTgqK4", "BM9YBwfS", "rKj2yNq", "ufru", "yxrbBgW", "zgLJzq", "mu5wvMDyAq", "ChnrwKy", "yMfU", "rKLmrq", "BM9YBwfSmG", "tuvnqKvsx05fv19usvrmrq", "C2vHCMnO", "uKvqtfK", "ntC2oxLnBNjZCa", "ANbN", "yLDsBeq", "Cfjeu3q", "zunNCLi", "yxrvC2vY", "BM90qxq", "oda3nJm5C2zHsvLv", "z09esvq", "Dg9tDhjPBMC", "y29UC3rYDwn0B3i", "nLDzvu5ptq", "zNjPzw5K", "Ahr0Chm6lY9Ny2HHDc5XCgLJlMnU", "nfflwgPhCa", "BwvTyMvYsw5JCMvHC2u", "vevyva", "rgzjsem", "uNLvt0e", "DM5ArMu", "tMn2Eeu", "vLrmqxa", "AgDqAfC", "mty4ntm1nxvoC2XZyq"];
  return oi = function() {
    return e;
  }, oi();
}
var sE = ((e) => {
  var t = vt, A = {};
  A.psQZF = t(232), A[t(278)] = t(272);
  var i = A;
  return e[e[t(232)] = 12] = i[t(268)], e[e[t(272)] = 17] = i[t(278)], e;
})(sE || {}), pt = ((e) => {
  var t = vt, A = {};
  A.nJCja = t(262), A[t(241)] = t(271), A[t(277)] = t(266);
  var i = A;
  return e[e[i.nJCja] = 1] = t(262), e[e[i.cCeJt] = 2] = t(271), e[e[i.bWRlD] = 3] = i[t(277)], e;
})(pt || {}), ai = ((e) => {
  var t = vt, A = {};
  A[t(261)] = t(266);
  var i = A;
  return e[e[i.EKFBN] = 358] = i.EKFBN, e[e[t(255)] = 359] = t(255), e;
})(ai || {}), CE = ((e) => {
  var t = vt, A = {};
  A.eJCRV = t(290), A[t(228)] = "kicked", A[t(239)] = t(269);
  var i = A;
  return e[e[i[t(231)]] = 1] = i.eJCRV, e[e[i[t(228)]] = 3] = i[t(228)], e[e[i[t(239)]] = 8] = i[t(239)], e;
})(CE || {});
(function(e, t) {
  for (var A = bA, i = e(); ; )
    try {
      var B = -parseInt(A(347)) / 1 * (parseInt(A(344)) / 2) + -parseInt(A(345)) / 3 * (parseInt(A(342)) / 4) + parseInt(A(354)) / 5 + parseInt(A(322)) / 6 + parseInt(A(337)) / 7 + parseInt(A(332)) / 8 * (-parseInt(A(349)) / 9) + parseInt(A(333)) / 10;
      if (B === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(si, 263944);
var Ho = /* @__PURE__ */ function() {
  var e = !0;
  return function(t, A) {
    var i = e ? function() {
      var B = bA;
      if (A) {
        var g = A[B(351)](t, arguments);
        return A = null, g;
      }
    } : function() {
    };
    return e = !1, i;
  };
}(), Bn = Ho(void 0, function() {
  var e = bA, t = {};
  t[e(326)] = e(330);
  var A = t;
  return Bn[e(335)]()[e(325)](A[e(326)])[e(335)]().constructor(Bn)[e(325)](A[e(326)]);
});
Bn();
var cE = ((e) => {
  var t = bA, A = {};
  A[t(340)] = "3|1|6|5|7|2|0|4", A[t(317)] = "ADMIN_UNSET", A[t(324)] = t(350), A[t(339)] = t(323), A[t(352)] = t(315), A[t(343)] = t(334), A.XLhGY = t(321), A[t(336)] = t(338);
  for (var i = A, B = i[t(340)][t(355)]("|"), g = 0; ; ) {
    switch (B[g++]) {
      case "0":
        e[e[i.ROaLr] = 12] = i.ROaLr;
        continue;
      case "1":
        e[e[i[t(324)]] = 4] = i[t(324)];
        continue;
      case "2":
        e[e[i[t(339)]] = 11] = "MEMBER_EXIT";
        continue;
      case "3":
        e[e[t(315)] = 1] = i[t(352)];
        continue;
      case "4":
        return e;
      case "5":
        e[e.ADMIN_SET = 8] = i[t(343)];
        continue;
      case "6":
        e[e[i[t(341)]] = 7] = "JOIN_REQUEST";
        continue;
      case "7":
        e[e[i[t(336)]] = 9] = t(338);
        continue;
    }
    break;
  }
})(cE || {});
function bA(e, t) {
  var A = si();
  return bA = function(i, B) {
    i = i - 315;
    var g = A[i];
    if (bA.HjDlYM === void 0) {
      var n = function(E) {
        for (var o = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=", c = "", l = "", u = c + n, C = 0, s, f, h = 0; f = E.charAt(h++); ~f && (s = C % 4 ? s * 64 + f : f, C++ % 4) ? c += u.charCodeAt(h + 10) - 10 !== 0 ? String.fromCharCode(255 & s >> (-2 * C & 6)) : C : 0)
          f = o.indexOf(f);
        for (var x = 0, d = c.length; x < d; x++)
          l += "%" + ("00" + c.charCodeAt(x).toString(16)).slice(-2);
        return decodeURIComponent(l);
      };
      bA.gBlzQh = n, e = arguments, bA.HjDlYM = !0;
    }
    var I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      var Q = function(E) {
        this.DjZSUm = E, this.SPzhPt = [1, 0, 0], this.ZCdvkp = function() {
          return "newState";
        }, this.kuGmus = "\\w+ *\\(\\) *{\\w+ *", this.UlKTjj = `['|"].+['|"];? *}`;
      };
      Q.prototype.ikxmOB = function() {
        var E = new RegExp(this.kuGmus + this.UlKTjj), o = E.test(this.ZCdvkp.toString()) ? --this.SPzhPt[1] : --this.SPzhPt[0];
        return this.MHmijQ(o);
      }, Q.prototype.MHmijQ = function(E) {
        return ~E ? this.ujftGJ(this.DjZSUm) : E;
      }, Q.prototype.ujftGJ = function(E) {
        for (var o = 0, c = this.SPzhPt.length; o < c; o++)
          this.SPzhPt.push(Math.round(Math.random())), c = this.SPzhPt.length;
        return E(this.SPzhPt[0]);
      }, new Q(bA).ikxmOB(), g = bA.gBlzQh(g), e[r] = g;
    }
    return g;
  }, bA(e, t);
}
function si() {
  var e = ["mZuYnK5wBgXlqG", "v0fjvf9iqu5eteu", "ote5odbzwergALy", "su5wsvrfrf9kt0Lo", "yxbWBhK", "AvjqwMK", "qvbquK9wrq", "ndC4ndCWC01owgD5", "C3bSAxq", "su5wsvrfx01f", "suDot1jf", "uK9Hthi", "uKvkrunu", "vwL3tg4", "sfLAB0i", "sK9jtL9srvfvrvnu", "mJu1nJeZmKj1yKz0wa", "tuvnqKvsx0vysvq", "ueHVDKy", "C2vHCMnO", "DLzdBgO", "CuHbEMC", "wenAwu8", "yxbWCM92zq", "kcGOlISPkYKRksSK", "CMvQzwn0", "odHoAKTizKi", "nZa3mJGXmgnnrgzACa", "qurnsu5Fu0vu", "Dg9tDhjPBMC", "qLzpt3q", "mZK4ntmXzMP0wMrR", "s0Lds19nru1crvi", "ww9huwi", "sKrZDNu", "weXOr1K", "mtG0odu2yNDRr1r3", "ruH6t28", "mJGWAKrKvvPm", "mJDszMvWqK4", "uuTgBNO"];
  return si = function() {
    return e;
  }, si();
}
var fE = ((e) => {
  var t = bA, A = {};
  A.qHAzg = t(316), A[t(319)] = t(348), A[t(346)] = t(353);
  var i = A;
  return e[e[t(316)] = 0] = i[t(327)], e[e[i[t(319)]] = 1] = i[t(319)], e[e[i.QKFnz] = 2] = i[t(346)], e[e[t(318)] = 3] = "REJECT", e;
})(fE || {}), uE = ((e) => {
  var t = bA, A = {};
  A[t(328)] = t(329), A[t(320)] = t(331);
  var i = A;
  return e[e[i[t(328)]] = 1] = i[t(328)], e[e[i[t(320)]] = 2] = i[t(320)], e;
})(uE || {});
function qA(e, t) {
  var A = Ci();
  return qA = function(i, B) {
    i = i - 250;
    var g = A[i];
    if (qA.emnxPk === void 0) {
      var n = function(E) {
        for (var o = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=", c = "", l = "", u = c + n, C = 0, s, f, h = 0; f = E.charAt(h++); ~f && (s = C % 4 ? s * 64 + f : f, C++ % 4) ? c += u.charCodeAt(h + 10) - 10 !== 0 ? String.fromCharCode(255 & s >> (-2 * C & 6)) : C : 0)
          f = o.indexOf(f);
        for (var x = 0, d = c.length; x < d; x++)
          l += "%" + ("00" + c.charCodeAt(x).toString(16)).slice(-2);
        return decodeURIComponent(l);
      };
      qA.qpklNX = n, e = arguments, qA.emnxPk = !0;
    }
    var I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      var Q = function(E) {
        this.KuRbhf = E, this.cOdDNQ = [1, 0, 0], this.klJCId = function() {
          return "newState";
        }, this.JCjQUH = "\\w+ *\\(\\) *{\\w+ *", this.dGHVtE = `['|"].+['|"];? *}`;
      };
      Q.prototype.neVudu = function() {
        var E = new RegExp(this.JCjQUH + this.dGHVtE), o = E.test(this.klJCId.toString()) ? --this.cOdDNQ[1] : --this.cOdDNQ[0];
        return this.DeQjsr(o);
      }, Q.prototype.DeQjsr = function(E) {
        return ~E ? this.xUbvgx(this.KuRbhf) : E;
      }, Q.prototype.xUbvgx = function(E) {
        for (var o = 0, c = this.cOdDNQ.length; o < c; o++)
          this.cOdDNQ.push(Math.round(Math.random())), c = this.cOdDNQ.length;
        return E(this.cOdDNQ[0]);
      }, new Q(qA).neVudu(), g = qA.qpklNX(g), e[r] = g;
    }
    return g;
  }, qA(e, t);
}
function Ci() {
  var e = ["C2vHCMnO", "whLgAwe", "mJq1mtK4mvrVsuzxEq", "AM11teK", "mZm3mgLZvwDSEa", "nJiWmZq0uennD0n6", "mZu2nZyZmgzjwu1dDW", "owz0D0f4Aq", "rKfez1O", "yxbWBhK", "BLnYu3y", "uerZuM0", "B0jMv1y", "mZm0nZDdt0HAEha", "qvvesu8", "mtCYnZyXnuvVAgPZyG", "AvnAEgu", "kcGOlISPkYKRksSK", "tuX3tvK", "z2Pru0y", "nJHqtwjuwNe", "vKLeru8", "su1br0u", "t1rirvi", "y29UC3rYDwn0B3i", "mJaWEu1HEeHO", "mZuYnJq0yxPnrhnv", "Dg9tDhjPBMC"];
  return Ci = function() {
    return e;
  }, Ci();
}
(function(e, t) {
  for (var A = qA, i = e(); ; )
    try {
      var B = -parseInt(A(262)) / 1 * (-parseInt(A(255)) / 2) + parseInt(A(271)) / 3 * (parseInt(A(250)) / 4) + -parseInt(A(273)) / 5 + -parseInt(A(256)) / 6 + parseInt(A(260)) / 7 + -parseInt(A(263)) / 8 * (-parseInt(A(265)) / 9) + -parseInt(A(264)) / 10;
      if (B === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(Ci, 193469);
var Yo = function() {
  var e = qA, t = {};
  t[e(277)] = function(B, g) {
    return B === g;
  }, t[e(274)] = "BdiDT";
  var A = t, i = !0;
  return function(B, g) {
    var n = i ? function() {
      var I = qA, r = {};
      r[I(261)] = "(((.+)+)+)+$";
      var a = r;
      if (A[I(277)](A.iSZxe, A.iSZxe)) {
        if (g) {
          var Q = g[I(267)](B, arguments);
          return g = null, Q;
        }
      } else
        return _0x148fa2[I(257)]()[I(258)](a[I(261)])[I(257)]()[I(254)](_0x4ceb31).search(a[I(261)]);
    } : function() {
    };
    return i = !1, n;
  };
}(), gn = Yo(void 0, function() {
  var e = qA, t = {};
  t[e(270)] = e(275);
  var A = t;
  return gn.toString()[e(258)](A[e(270)]).toString()[e(254)](gn)[e(258)](A[e(270)]);
});
gn();
var xE = ((e) => {
  var t = qA, A = {};
  A[t(259)] = t(252), A[t(268)] = t(251), A[t(269)] = t(272), A[t(266)] = "DOCUMENT", A[t(276)] = t(253);
  var i = A;
  return e[e[t(252)] = 0] = i.XyFia, e[e[i[t(268)]] = 1] = i[t(268)], e[e[i[t(269)]] = 2] = i[t(269)], e[e[i[t(266)]] = 3] = i[t(266)], e[e[i[t(276)]] = 4] = t(253), e;
})(xE || {}), it = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function gB(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Lo(e) {
  if (e.__esModule)
    return e;
  var t = e.default;
  if (typeof t == "function") {
    var A = function i() {
      return this instanceof i ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
    };
    A.prototype = t.prototype;
  } else
    A = {};
  return Object.defineProperty(A, "__esModule", { value: !0 }), Object.keys(e).forEach(function(i) {
    var B = Object.getOwnPropertyDescriptor(e, i);
    Object.defineProperty(A, i, B.get ? B : {
      enumerable: !0,
      get: function() {
        return e[i];
      }
    });
  }), A;
}
var MB = { exports: {} }, kB, GI;
function Mo() {
  if (GI)
    return kB;
  GI = 1, kB = i, i.sync = B;
  var e = nA;
  function t(g, n) {
    var I = n.pathExt !== void 0 ? n.pathExt : process.env.PATHEXT;
    if (!I || (I = I.split(";"), I.indexOf("") !== -1))
      return !0;
    for (var r = 0; r < I.length; r++) {
      var a = I[r].toLowerCase();
      if (a && g.substr(-a.length).toLowerCase() === a)
        return !0;
    }
    return !1;
  }
  function A(g, n, I) {
    return !g.isSymbolicLink() && !g.isFile() ? !1 : t(n, I);
  }
  function i(g, n, I) {
    e.stat(g, function(r, a) {
      I(r, r ? !1 : A(a, g, n));
    });
  }
  function B(g, n) {
    return A(e.statSync(g), g, n);
  }
  return kB;
}
var KB, FI;
function ko() {
  if (FI)
    return KB;
  FI = 1, KB = t, t.sync = A;
  var e = nA;
  function t(g, n, I) {
    e.stat(g, function(r, a) {
      I(r, r ? !1 : i(a, n));
    });
  }
  function A(g, n) {
    return i(e.statSync(g), n);
  }
  function i(g, n) {
    return g.isFile() && B(g, n);
  }
  function B(g, n) {
    var I = g.mode, r = g.uid, a = g.gid, Q = n.uid !== void 0 ? n.uid : process.getuid && process.getuid(), E = n.gid !== void 0 ? n.gid : process.getgid && process.getgid(), o = parseInt("100", 8), c = parseInt("010", 8), l = parseInt("001", 8), u = o | c, C = I & l || I & c && a === E || I & o && r === Q || I & u && Q === 0;
    return C;
  }
  return KB;
}
var JB, RI;
function Ko() {
  if (RI)
    return JB;
  RI = 1;
  var e;
  process.platform === "win32" || it.TESTING_WINDOWS ? e = Mo() : e = ko(), JB = t, t.sync = A;
  function t(i, B, g) {
    if (typeof B == "function" && (g = B, B = {}), !g) {
      if (typeof Promise != "function")
        throw new TypeError("callback not provided");
      return new Promise(function(n, I) {
        t(i, B || {}, function(r, a) {
          r ? I(r) : n(a);
        });
      });
    }
    e(i, B || {}, function(n, I) {
      n && (n.code === "EACCES" || B && B.ignoreErrors) && (n = null, I = !1), g(n, I);
    });
  }
  function A(i, B) {
    try {
      return e.sync(i, B || {});
    } catch (g) {
      if (B && B.ignoreErrors || g.code === "EACCES")
        return !1;
      throw g;
    }
  }
  return JB;
}
var WB, SI;
function Jo() {
  if (SI)
    return WB;
  SI = 1, WB = n, n.sync = I;
  var e = process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys", t = vA, A = e ? ";" : ":", i = Ko();
  function B(r) {
    var a = new Error("not found: " + r);
    return a.code = "ENOENT", a;
  }
  function g(r, a) {
    var Q = a.colon || A, E = a.path || process.env.PATH || "", o = [""];
    E = E.split(Q);
    var c = "";
    return e && (E.unshift(process.cwd()), c = a.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM", o = c.split(Q), r.indexOf(".") !== -1 && o[0] !== "" && o.unshift("")), (r.match(/\//) || e && r.match(/\\/)) && (E = [""]), {
      env: E,
      ext: o,
      extExe: c
    };
  }
  function n(r, a, Q) {
    typeof a == "function" && (Q = a, a = {});
    var E = g(r, a), o = E.env, c = E.ext, l = E.extExe, u = [];
    (function C(s, f) {
      if (s === f)
        return a.all && u.length ? Q(null, u) : Q(B(r));
      var h = o[s];
      h.charAt(0) === '"' && h.slice(-1) === '"' && (h = h.slice(1, -1));
      var x = t.join(h, r);
      !h && /^\.[\\\/]/.test(r) && (x = r.slice(0, 2) + x), function d(m, H) {
        if (m === H)
          return C(s + 1, f);
        var v = c[m];
        i(x + v, { pathExt: l }, function(N, M) {
          if (!N && M)
            if (a.all)
              u.push(x + v);
            else
              return Q(null, x + v);
          return d(m + 1, H);
        });
      }(0, c.length);
    })(0, o.length);
  }
  function I(r, a) {
    a = a || {};
    for (var Q = g(r, a), E = Q.env, o = Q.ext, c = Q.extExe, l = [], u = 0, C = E.length; u < C; u++) {
      var s = E[u];
      s.charAt(0) === '"' && s.slice(-1) === '"' && (s = s.slice(1, -1));
      var f = t.join(s, r);
      !s && /^\.[\\\/]/.test(r) && (f = r.slice(0, 2) + f);
      for (var h = 0, x = o.length; h < x; h++) {
        var d = f + o[h], m;
        try {
          if (m = i.sync(d, { pathExt: c }), m)
            if (a.all)
              l.push(d);
            else
              return d;
        } catch {
        }
      }
    }
    if (a.all && l.length)
      return l;
    if (a.nothrow)
      return null;
    throw B(r);
  }
  return WB;
}
var bI;
function Ne() {
  if (bI)
    return MB.exports;
  bI = 1, Vn.exec;
  var e = tE.platform().match(/win(32|64)/), t = Jo(), A = /\r\n|\r|\n/g, i = /^\[?(.*?)\]?$/, B = /[,]/, g = {};
  function n(r) {
    var a = {};
    r = r.replace(/=\s+/g, "=").trim();
    for (var Q = r.split(" "), E = 0; E < Q.length; E++) {
      var o = Q[E].split("=", 2), c = o[0], l = o[1];
      if (typeof l > "u")
        return null;
      a[c] = l;
    }
    return a;
  }
  var I = MB.exports = {
    isWindows: e,
    streamRegexp: i,
    /**
     * Copy an object keys into another one
     *
     * @param {Object} source source object
     * @param {Object} dest destination object
     * @private
     */
    copy: function(r, a) {
      Object.keys(r).forEach(function(Q) {
        a[Q] = r[Q];
      });
    },
    /**
     * Create an argument list
     *
     * Returns a function that adds new arguments to the list.
     * It also has the following methods:
     * - clear() empties the argument list
     * - get() returns the argument list
     * - find(arg, count) finds 'arg' in the list and return the following 'count' items, or undefined if not found
     * - remove(arg, count) remove 'arg' in the list as well as the following 'count' items
     *
     * @private
     */
    args: function() {
      var r = [], a = function() {
        arguments.length === 1 && Array.isArray(arguments[0]) ? r = r.concat(arguments[0]) : r = r.concat([].slice.call(arguments));
      };
      return a.clear = function() {
        r = [];
      }, a.get = function() {
        return r;
      }, a.find = function(Q, E) {
        var o = r.indexOf(Q);
        if (o !== -1)
          return r.slice(o + 1, o + 1 + (E || 0));
      }, a.remove = function(Q, E) {
        var o = r.indexOf(Q);
        o !== -1 && r.splice(o, (E || 0) + 1);
      }, a.clone = function() {
        var Q = I.args();
        return Q(r), Q;
      }, a;
    },
    /**
     * Generate filter strings
     *
     * @param {String[]|Object[]} filters filter specifications. When using objects,
     *   each must have the following properties:
     * @param {String} filters.filter filter name
     * @param {String|Array} [filters.inputs] (array of) input stream specifier(s) for the filter,
     *   defaults to ffmpeg automatically choosing the first unused matching streams
     * @param {String|Array} [filters.outputs] (array of) output stream specifier(s) for the filter,
     *   defaults to ffmpeg automatically assigning the output to the output file
     * @param {Object|String|Array} [filters.options] filter options, can be omitted to not set any options
     * @return String[]
     * @private
     */
    makeFilterStrings: function(r) {
      return r.map(function(a) {
        if (typeof a == "string")
          return a;
        var Q = "";
        return Array.isArray(a.inputs) ? Q += a.inputs.map(function(E) {
          return E.replace(i, "[$1]");
        }).join("") : typeof a.inputs == "string" && (Q += a.inputs.replace(i, "[$1]")), Q += a.filter, a.options && (typeof a.options == "string" || typeof a.options == "number" ? Q += "=" + a.options : Array.isArray(a.options) ? Q += "=" + a.options.map(function(E) {
          return typeof E == "string" && E.match(B) ? "'" + E + "'" : E;
        }).join(":") : Object.keys(a.options).length && (Q += "=" + Object.keys(a.options).map(function(E) {
          var o = a.options[E];
          return typeof o == "string" && o.match(B) && (o = "'" + o + "'"), E + "=" + o;
        }).join(":"))), Array.isArray(a.outputs) ? Q += a.outputs.map(function(E) {
          return E.replace(i, "[$1]");
        }).join("") : typeof a.outputs == "string" && (Q += a.outputs.replace(i, "[$1]")), Q;
      });
    },
    /**
     * Search for an executable
     *
     * Uses 'which' or 'where' depending on platform
     *
     * @param {String} name executable name
     * @param {Function} callback callback with signature (err, path)
     * @private
     */
    which: function(r, a) {
      if (r in g)
        return a(null, g[r]);
      t(r, function(Q, E) {
        if (Q)
          return a(null, g[r] = "");
        a(null, g[r] = E);
      });
    },
    /**
     * Convert a [[hh:]mm:]ss[.xxx] timemark into seconds
     *
     * @param {String} timemark timemark string
     * @return Number
     * @private
     */
    timemarkToSeconds: function(r) {
      if (typeof r == "number")
        return r;
      if (r.indexOf(":") === -1 && r.indexOf(".") >= 0)
        return Number(r);
      var a = r.split(":"), Q = Number(a.pop());
      return a.length && (Q += Number(a.pop()) * 60), a.length && (Q += Number(a.pop()) * 3600), Q;
    },
    /**
     * Extract codec data from ffmpeg stderr and emit 'codecData' event if appropriate
     * Call it with an initially empty codec object once with each line of stderr output until it returns true
     *
     * @param {FfmpegCommand} command event emitter
     * @param {String} stderrLine ffmpeg stderr output line
     * @param {Object} codecObject object used to accumulate codec data between calls
     * @return {Boolean} true if codec data is complete (and event was emitted), false otherwise
     * @private
     */
    extractCodecData: function(r, a, Q) {
      var E = /Input #[0-9]+, ([^ ]+),/, o = /Duration\: ([^,]+)/, c = /Audio\: (.*)/, l = /Video\: (.*)/;
      "inputStack" in Q || (Q.inputStack = [], Q.inputIndex = -1, Q.inInput = !1);
      var u = Q.inputStack, C = Q.inputIndex, s = Q.inInput, f, h, x, d;
      if (f = a.match(E))
        s = Q.inInput = !0, C = Q.inputIndex = Q.inputIndex + 1, u[C] = { format: f[1], audio: "", video: "", duration: "" };
      else if (s && (h = a.match(o)))
        u[C].duration = h[1];
      else if (s && (x = a.match(c)))
        x = x[1].split(", "), u[C].audio = x[0], u[C].audio_details = x;
      else if (s && (d = a.match(l)))
        d = d[1].split(", "), u[C].video = d[0], u[C].video_details = d;
      else if (/Output #\d+/.test(a))
        s = Q.inInput = !1;
      else if (/Stream mapping:|Press (\[q\]|ctrl-c) to stop/.test(a))
        return r.emit.apply(r, ["codecData"].concat(u)), !0;
      return !1;
    },
    /**
     * Extract progress data from ffmpeg stderr and emit 'progress' event if appropriate
     *
     * @param {FfmpegCommand} command event emitter
     * @param {String} stderrLine ffmpeg stderr data
     * @private
     */
    extractProgress: function(r, a) {
      var Q = n(a);
      if (Q) {
        var E = {
          frames: parseInt(Q.frame, 10),
          currentFps: parseInt(Q.fps, 10),
          currentKbps: Q.bitrate ? parseFloat(Q.bitrate.replace("kbits/s", "")) : 0,
          targetSize: parseInt(Q.size || Q.Lsize, 10),
          timemark: Q.time
        };
        if (r._ffprobeData && r._ffprobeData.format && r._ffprobeData.format.duration) {
          var o = Number(r._ffprobeData.format.duration);
          isNaN(o) || (E.percent = I.timemarkToSeconds(E.timemark) / o * 100);
        }
        r.emit("progress", E);
      }
    },
    /**
     * Extract error message(s) from ffmpeg stderr
     *
     * @param {String} stderr ffmpeg stderr data
     * @return {String}
     * @private
     */
    extractError: function(r) {
      return r.split(A).reduce(function(a, Q) {
        return Q.charAt(0) === " " || Q.charAt(0) === "[" ? [] : (a.push(Q), a);
      }, []).join(`
`);
    },
    /**
     * Creates a line ring buffer object with the following methods:
     * - append(str) : appends a string or buffer
     * - get() : returns the whole string
     * - close() : prevents further append() calls and does a last call to callbacks
     * - callback(cb) : calls cb for each line (incl. those already in the ring)
     *
     * @param {Numebr} maxLines maximum number of lines to store (<= 0 for unlimited)
     */
    linesRing: function(r) {
      var a = [], Q = [], E = null, o = !1, c = r - 1;
      function l(u) {
        a.forEach(function(C) {
          C(u);
        });
      }
      return {
        callback: function(u) {
          Q.forEach(function(C) {
            u(C);
          }), a.push(u);
        },
        append: function(u) {
          if (!o && (u instanceof Buffer && (u = "" + u), !(!u || u.length === 0))) {
            var C = u.split(A);
            C.length === 1 ? E !== null ? E = E + C.shift() : E = C.shift() : (E !== null && (E = E + C.shift(), l(E), Q.push(E)), E = C.pop(), C.forEach(function(s) {
              l(s), Q.push(s);
            }), c > -1 && Q.length > c && Q.splice(0, Q.length - c));
          }
        },
        get: function() {
          return E !== null ? Q.concat([E]).join(`
`) : Q.join(`
`);
        },
        close: function() {
          o || (E !== null && (l(E), Q.push(E), c > -1 && Q.length > c && Q.shift(), E = null), o = !0);
        }
      };
    }
  };
  return MB.exports;
}
var qB, NI;
function Wo() {
  if (NI)
    return qB;
  NI = 1;
  var e = Ne();
  return qB = function(t) {
    t.mergeAdd = t.addInput = t.input = function(A) {
      var i = !1, B = !1;
      if (typeof A != "string") {
        if (!("readable" in A) || !A.readable)
          throw new Error("Invalid input");
        var g = this._inputs.some(function(I) {
          return I.isStream;
        });
        if (g)
          throw new Error("Only one input stream is supported");
        B = !0, A.pause();
      } else {
        var n = A.match(/^([a-z]{2,}):/i);
        i = !n || n[0] === "file";
      }
      return this._inputs.push(this._currentInput = {
        source: A,
        isFile: i,
        isStream: B,
        options: e.args()
      }), this;
    }, t.withInputFormat = t.inputFormat = t.fromFormat = function(A) {
      if (!this._currentInput)
        throw new Error("No input specified");
      return this._currentInput.options("-f", A), this;
    }, t.withInputFps = t.withInputFPS = t.withFpsInput = t.withFPSInput = t.inputFPS = t.inputFps = t.fpsInput = t.FPSInput = function(A) {
      if (!this._currentInput)
        throw new Error("No input specified");
      return this._currentInput.options("-r", A), this;
    }, t.nativeFramerate = t.withNativeFramerate = t.native = function() {
      if (!this._currentInput)
        throw new Error("No input specified");
      return this._currentInput.options("-re"), this;
    }, t.setStartTime = t.seekInput = function(A) {
      if (!this._currentInput)
        throw new Error("No input specified");
      return this._currentInput.options("-ss", A), this;
    }, t.loop = function(A) {
      if (!this._currentInput)
        throw new Error("No input specified");
      return this._currentInput.options("-loop", "1"), typeof A < "u" && this.duration(A), this;
    };
  }, qB;
}
var ZB, UI;
function qo() {
  if (UI)
    return ZB;
  UI = 1;
  var e = Ne();
  return ZB = function(t) {
    t.withNoAudio = t.noAudio = function() {
      return this._currentOutput.audio.clear(), this._currentOutput.audioFilters.clear(), this._currentOutput.audio("-an"), this;
    }, t.withAudioCodec = t.audioCodec = function(A) {
      return this._currentOutput.audio("-acodec", A), this;
    }, t.withAudioBitrate = t.audioBitrate = function(A) {
      return this._currentOutput.audio("-b:a", ("" + A).replace(/k?$/, "k")), this;
    }, t.withAudioChannels = t.audioChannels = function(A) {
      return this._currentOutput.audio("-ac", A), this;
    }, t.withAudioFrequency = t.audioFrequency = function(A) {
      return this._currentOutput.audio("-ar", A), this;
    }, t.withAudioQuality = t.audioQuality = function(A) {
      return this._currentOutput.audio("-aq", A), this;
    }, t.withAudioFilter = t.withAudioFilters = t.audioFilter = t.audioFilters = function(A) {
      return arguments.length > 1 && (A = [].slice.call(arguments)), Array.isArray(A) || (A = [A]), this._currentOutput.audioFilters(e.makeFilterStrings(A)), this;
    };
  }, ZB;
}
var VB, vI;
function Zo() {
  if (vI)
    return VB;
  vI = 1;
  var e = Ne();
  return VB = function(t) {
    t.withNoVideo = t.noVideo = function() {
      return this._currentOutput.video.clear(), this._currentOutput.videoFilters.clear(), this._currentOutput.video("-vn"), this;
    }, t.withVideoCodec = t.videoCodec = function(A) {
      return this._currentOutput.video("-vcodec", A), this;
    }, t.withVideoBitrate = t.videoBitrate = function(A, i) {
      return A = ("" + A).replace(/k?$/, "k"), this._currentOutput.video("-b:v", A), i && this._currentOutput.video(
        "-maxrate",
        A,
        "-minrate",
        A,
        "-bufsize",
        "3M"
      ), this;
    }, t.withVideoFilter = t.withVideoFilters = t.videoFilter = t.videoFilters = function(A) {
      return arguments.length > 1 && (A = [].slice.call(arguments)), Array.isArray(A) || (A = [A]), this._currentOutput.videoFilters(e.makeFilterStrings(A)), this;
    }, t.withOutputFps = t.withOutputFPS = t.withFpsOutput = t.withFPSOutput = t.withFps = t.withFPS = t.outputFPS = t.outputFps = t.fpsOutput = t.FPSOutput = t.fps = t.FPS = function(A) {
      return this._currentOutput.video("-r", A), this;
    }, t.takeFrames = t.withFrames = t.frames = function(A) {
      return this._currentOutput.video("-vframes", A), this;
    };
  }, VB;
}
var TB, HI;
function Vo() {
  if (HI)
    return TB;
  HI = 1;
  function e(A, i, B, g) {
    return [
      /*
        In both cases, we first have to scale the input to match the requested size.
        When using computed width/height, we truncate them to multiples of 2
       */
      {
        filter: "scale",
        options: {
          w: "if(gt(a," + B + ")," + A + ",trunc(" + i + "*a/2)*2)",
          h: "if(lt(a," + B + ")," + i + ",trunc(" + A + "/a/2)*2)"
        }
      },
      /*
        Then we pad the scaled input to match the target size
        (here iw and ih refer to the padding input, i.e the scaled output)
       */
      {
        filter: "pad",
        options: {
          w: A,
          h: i,
          x: "if(gt(a," + B + "),0,(" + A + "-iw)/2)",
          y: "if(lt(a," + B + "),0,(" + i + "-ih)/2)",
          color: g
        }
      }
    ];
  }
  function t(A, i, B) {
    var g = A.sizeData = A.sizeData || {};
    if (g[i] = B, !("size" in g))
      return [];
    var n = g.size.match(/([0-9]+)x([0-9]+)/), I = g.size.match(/([0-9]+)x\?/), r = g.size.match(/\?x([0-9]+)/), a = g.size.match(/\b([0-9]{1,3})%/), Q, E, o;
    if (a) {
      var c = Number(a[1]) / 100;
      return [{
        filter: "scale",
        options: {
          w: "trunc(iw*" + c + "/2)*2",
          h: "trunc(ih*" + c + "/2)*2"
        }
      }];
    } else {
      if (n)
        return Q = Math.round(Number(n[1]) / 2) * 2, E = Math.round(Number(n[2]) / 2) * 2, o = Q / E, g.pad ? e(Q, E, o, g.pad) : [{ filter: "scale", options: { w: Q, h: E } }];
      if (I || r)
        return "aspect" in g ? (Q = I ? I[1] : Math.round(Number(r[1]) * g.aspect), E = r ? r[1] : Math.round(Number(I[1]) / g.aspect), Q = Math.round(Q / 2) * 2, E = Math.round(E / 2) * 2, g.pad ? e(Q, E, g.aspect, g.pad) : [{ filter: "scale", options: { w: Q, h: E } }]) : I ? [{
          filter: "scale",
          options: {
            w: Math.round(Number(I[1]) / 2) * 2,
            h: "trunc(ow/a/2)*2"
          }
        }] : [{
          filter: "scale",
          options: {
            w: "trunc(oh*a/2)*2",
            h: Math.round(Number(r[1]) / 2) * 2
          }
        }];
      throw new Error("Invalid size specified: " + g.size);
    }
  }
  return TB = function(A) {
    A.keepPixelAspect = // Only for compatibility, this is not about keeping _pixel_ aspect ratio
    A.keepDisplayAspect = A.keepDisplayAspectRatio = A.keepDAR = function() {
      return this.videoFilters([
        {
          filter: "scale",
          options: {
            w: "if(gt(sar,1),iw*sar,iw)",
            h: "if(lt(sar,1),ih/sar,ih)"
          }
        },
        {
          filter: "setsar",
          options: "1"
        }
      ]);
    }, A.withSize = A.setSize = A.size = function(i) {
      var B = t(this._currentOutput, "size", i);
      return this._currentOutput.sizeFilters.clear(), this._currentOutput.sizeFilters(B), this;
    }, A.withAspect = A.withAspectRatio = A.setAspect = A.setAspectRatio = A.aspect = A.aspectRatio = function(i) {
      var B = Number(i);
      if (isNaN(B)) {
        var g = i.match(/^(\d+):(\d+)$/);
        if (g)
          B = Number(g[1]) / Number(g[2]);
        else
          throw new Error("Invalid aspect ratio: " + i);
      }
      var n = t(this._currentOutput, "aspect", B);
      return this._currentOutput.sizeFilters.clear(), this._currentOutput.sizeFilters(n), this;
    }, A.applyAutopadding = A.applyAutoPadding = A.applyAutopad = A.applyAutoPad = A.withAutopadding = A.withAutoPadding = A.withAutopad = A.withAutoPad = A.autoPad = A.autopad = function(i, B) {
      typeof i == "string" && (B = i, i = !0), typeof i > "u" && (i = !0);
      var g = t(this._currentOutput, "pad", i ? B || "black" : !1);
      return this._currentOutput.sizeFilters.clear(), this._currentOutput.sizeFilters(g), this;
    };
  }, TB;
}
var PB, YI;
function To() {
  if (YI)
    return PB;
  YI = 1;
  var e = Ne();
  return PB = function(t) {
    t.addOutput = t.output = function(A, i) {
      var B = !1;
      if (!A && this._currentOutput)
        throw new Error("Invalid output");
      if (A && typeof A != "string") {
        if (!("writable" in A) || !A.writable)
          throw new Error("Invalid output");
      } else if (typeof A == "string") {
        var g = A.match(/^([a-z]{2,}):/i);
        B = !g || g[0] === "file";
      }
      if (A && !("target" in this._currentOutput))
        this._currentOutput.target = A, this._currentOutput.isFile = B, this._currentOutput.pipeopts = i || {};
      else {
        if (A && typeof A != "string") {
          var n = this._outputs.some(function(r) {
            return typeof r.target != "string";
          });
          if (n)
            throw new Error("Only one output stream is supported");
        }
        this._outputs.push(this._currentOutput = {
          target: A,
          isFile: B,
          flags: {},
          pipeopts: i || {}
        });
        var I = this;
        ["audio", "audioFilters", "video", "videoFilters", "sizeFilters", "options"].forEach(function(r) {
          I._currentOutput[r] = e.args();
        }), A || delete this._currentOutput.target;
      }
      return this;
    }, t.seekOutput = t.seek = function(A) {
      return this._currentOutput.options("-ss", A), this;
    }, t.withDuration = t.setDuration = t.duration = function(A) {
      return this._currentOutput.options("-t", A), this;
    }, t.toFormat = t.withOutputFormat = t.outputFormat = t.format = function(A) {
      return this._currentOutput.options("-f", A), this;
    }, t.map = function(A) {
      return this._currentOutput.options("-map", A.replace(e.streamRegexp, "[$1]")), this;
    }, t.updateFlvMetadata = t.flvmeta = function() {
      return this._currentOutput.flags.flvmeta = !0, this;
    };
  }, PB;
}
var XB, LI;
function Po() {
  if (LI)
    return XB;
  LI = 1;
  var e = Ne();
  return XB = function(t) {
    t.addInputOption = t.addInputOptions = t.withInputOption = t.withInputOptions = t.inputOption = t.inputOptions = function(A) {
      if (!this._currentInput)
        throw new Error("No input specified");
      var i = !0;
      return arguments.length > 1 && (A = [].slice.call(arguments), i = !1), Array.isArray(A) || (A = [A]), this._currentInput.options(A.reduce(function(B, g) {
        var n = String(g).split(" ");
        return i && n.length === 2 ? B.push(n[0], n[1]) : B.push(g), B;
      }, [])), this;
    }, t.addOutputOption = t.addOutputOptions = t.addOption = t.addOptions = t.withOutputOption = t.withOutputOptions = t.withOption = t.withOptions = t.outputOption = t.outputOptions = function(A) {
      var i = !0;
      return arguments.length > 1 && (A = [].slice.call(arguments), i = !1), Array.isArray(A) || (A = [A]), this._currentOutput.options(A.reduce(function(B, g) {
        var n = String(g).split(" ");
        return i && n.length === 2 ? B.push(n[0], n[1]) : B.push(g), B;
      }, [])), this;
    }, t.filterGraph = t.complexFilter = function(A, i) {
      if (this._complexFilters.clear(), Array.isArray(A) || (A = [A]), this._complexFilters("-filter_complex", e.makeFilterStrings(A).join(";")), Array.isArray(i)) {
        var B = this;
        i.forEach(function(g) {
          B._complexFilters("-map", g.replace(e.streamRegexp, "[$1]"));
        });
      } else
        typeof i == "string" && this._complexFilters("-map", i.replace(e.streamRegexp, "[$1]"));
      return this;
    };
  }, XB;
}
function Xn(e) {
  throw new Error('Could not dynamically require "' + e + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var zB, MI;
function Xo() {
  if (MI)
    return zB;
  MI = 1;
  var e = vA;
  return zB = function(t) {
    t.usingPreset = t.preset = function(A) {
      if (typeof A == "function")
        A(this);
      else
        try {
          var i = e.join(this.options.presets, A), B = Xn(i);
          if (typeof B.load == "function")
            B.load(this);
          else
            throw new Error("preset " + i + " has no load() function");
        } catch (g) {
          throw new Error("preset " + i + " could not be loaded: " + g.message);
        }
      return this;
    };
  }, zB;
}
function hE(e, ...t) {
  return (...A) => e(...t, ...A);
}
function Ht(e) {
  return function(...t) {
    var A = t.pop();
    return e.call(this, t, A);
  };
}
var zo = typeof queueMicrotask == "function" && queueMicrotask, dE = typeof setImmediate == "function" && setImmediate, lE = typeof process == "object" && typeof process.nextTick == "function";
function wE(e) {
  setTimeout(e, 0);
}
function yE(e) {
  return (t, ...A) => e(() => t(...A));
}
var Dt;
zo ? Dt = queueMicrotask : dE ? Dt = setImmediate : lE ? Dt = process.nextTick : Dt = wE;
var Ze = yE(Dt);
function Gt(e) {
  return Yt(e) ? function(...t) {
    const A = t.pop(), i = e.apply(this, t);
    return kI(i, A);
  } : Ht(function(t, A) {
    var i;
    try {
      i = e.apply(this, t);
    } catch (B) {
      return A(B);
    }
    if (i && typeof i.then == "function")
      return kI(i, A);
    A(null, i);
  });
}
function kI(e, t) {
  return e.then((A) => {
    KI(t, null, A);
  }, (A) => {
    KI(t, A && (A instanceof Error || A.message) ? A : new Error(A));
  });
}
function KI(e, t, A) {
  try {
    e(t, A);
  } catch (i) {
    Ze((B) => {
      throw B;
    }, i);
  }
}
function Yt(e) {
  return e[Symbol.toStringTag] === "AsyncFunction";
}
function Oo(e) {
  return e[Symbol.toStringTag] === "AsyncGenerator";
}
function _o(e) {
  return typeof e[Symbol.asyncIterator] == "function";
}
function eA(e) {
  if (typeof e != "function")
    throw new Error("expected a function");
  return Yt(e) ? Gt(e) : e;
}
function AA(e, t) {
  if (t || (t = e.length), !t)
    throw new Error("arity is undefined");
  function A(...i) {
    return typeof i[t - 1] == "function" ? e.apply(this, i) : new Promise((B, g) => {
      i[t - 1] = (n, ...I) => {
        if (n)
          return g(n);
        B(I.length > 1 ? I : I[0]);
      }, e.apply(this, i);
    });
  }
  return A;
}
function DE(e) {
  return function(A, ...i) {
    return AA(function(g) {
      var n = this;
      return e(A, (I, r) => {
        eA(I).apply(n, i.concat(r));
      }, g);
    });
  };
}
function zn(e, t, A, i) {
  t = t || [];
  var B = [], g = 0, n = eA(A);
  return e(t, (I, r, a) => {
    var Q = g++;
    n(I, (E, o) => {
      B[Q] = o, a(E);
    });
  }, (I) => {
    i(I, B);
  });
}
function nB(e) {
  return e && typeof e.length == "number" && e.length >= 0 && e.length % 1 === 0;
}
const jo = {};
var IB = jo;
function Xe(e) {
  function t(...A) {
    if (e !== null) {
      var i = e;
      e = null, i.apply(this, A);
    }
  }
  return Object.assign(t, e), t;
}
function $o(e) {
  return e[Symbol.iterator] && e[Symbol.iterator]();
}
function Aa(e) {
  var t = -1, A = e.length;
  return function() {
    return ++t < A ? { value: e[t], key: t } : null;
  };
}
function ea(e) {
  var t = -1;
  return function() {
    var i = e.next();
    return i.done ? null : (t++, { value: i.value, key: t });
  };
}
function ta(e) {
  var t = e ? Object.keys(e) : [], A = -1, i = t.length;
  return function B() {
    var g = t[++A];
    return g === "__proto__" ? B() : A < i ? { value: e[g], key: g } : null;
  };
}
function ia(e) {
  if (nB(e))
    return Aa(e);
  var t = $o(e);
  return t ? ea(t) : ta(e);
}
function ze(e) {
  return function(...t) {
    if (e === null)
      throw new Error("Callback was already called.");
    var A = e;
    e = null, A.apply(this, t);
  };
}
function JI(e, t, A, i) {
  let B = !1, g = !1, n = !1, I = 0, r = 0;
  function a() {
    I >= t || n || B || (n = !0, e.next().then(({ value: o, done: c }) => {
      if (!(g || B)) {
        if (n = !1, c) {
          B = !0, I <= 0 && i(null);
          return;
        }
        I++, A(o, r, Q), r++, a();
      }
    }).catch(E));
  }
  function Q(o, c) {
    if (I -= 1, !g) {
      if (o)
        return E(o);
      if (o === !1) {
        B = !0, g = !0;
        return;
      }
      if (c === IB || B && I <= 0)
        return B = !0, i(null);
      a();
    }
  }
  function E(o) {
    g || (n = !1, B = !0, i(o));
  }
  a();
}
var Ce = (e) => (t, A, i) => {
  if (i = Xe(i), e <= 0)
    throw new RangeError("concurrency limit cannot be less than 1");
  if (!t)
    return i(null);
  if (Oo(t))
    return JI(t, e, A, i);
  if (_o(t))
    return JI(t[Symbol.asyncIterator](), e, A, i);
  var B = ia(t), g = !1, n = !1, I = 0, r = !1;
  function a(E, o) {
    if (!n)
      if (I -= 1, E)
        g = !0, i(E);
      else if (E === !1)
        g = !0, n = !0;
      else {
        if (o === IB || g && I <= 0)
          return g = !0, i(null);
        r || Q();
      }
  }
  function Q() {
    for (r = !0; I < e && !g; ) {
      var E = B();
      if (E === null) {
        g = !0, I <= 0 && i(null);
        return;
      }
      I += 1, A(E.value, E.key, ze(a));
    }
    r = !1;
  }
  Q();
};
function Ba(e, t, A, i) {
  return Ce(t)(e, eA(A), i);
}
var Ct = AA(Ba, 4);
function ga(e, t, A) {
  A = Xe(A);
  var i = 0, B = 0, { length: g } = e, n = !1;
  g === 0 && A(null);
  function I(r, a) {
    r === !1 && (n = !0), n !== !0 && (r ? A(r) : (++B === g || a === IB) && A(null));
  }
  for (; i < g; i++)
    t(e[i], i, ze(I));
}
function na(e, t, A) {
  return Ct(e, 1 / 0, t, A);
}
function Ia(e, t, A) {
  var i = nB(e) ? ga : na;
  return i(e, eA(t), A);
}
var HA = AA(Ia, 3);
function ra(e, t, A) {
  return zn(HA, e, t, A);
}
var rB = AA(ra, 3), pE = DE(rB);
function Ea(e, t, A) {
  return Ct(e, 1, t, A);
}
var se = AA(Ea, 3);
function Qa(e, t, A) {
  return zn(se, e, t, A);
}
var On = AA(Qa, 3), mE = DE(On);
const xt = Symbol("promiseCallback");
function ct() {
  let e, t;
  function A(i, ...B) {
    if (i)
      return t(i);
    e(B.length > 1 ? B : B[0]);
  }
  return A[xt] = new Promise((i, B) => {
    e = i, t = B;
  }), A;
}
function _n(e, t, A) {
  typeof t != "number" && (A = t, t = null), A = Xe(A || ct());
  var i = Object.keys(e).length;
  if (!i)
    return A(null);
  t || (t = i);
  var B = {}, g = 0, n = !1, I = !1, r = /* @__PURE__ */ Object.create(null), a = [], Q = [], E = {};
  Object.keys(e).forEach((h) => {
    var x = e[h];
    if (!Array.isArray(x)) {
      o(h, [x]), Q.push(h);
      return;
    }
    var d = x.slice(0, x.length - 1), m = d.length;
    if (m === 0) {
      o(h, x), Q.push(h);
      return;
    }
    E[h] = m, d.forEach((H) => {
      if (!e[H])
        throw new Error("async.auto task `" + h + "` has a non-existent dependency `" + H + "` in " + d.join(", "));
      l(H, () => {
        m--, m === 0 && o(h, x);
      });
    });
  }), s(), c();
  function o(h, x) {
    a.push(() => C(h, x));
  }
  function c() {
    if (!n) {
      if (a.length === 0 && g === 0)
        return A(null, B);
      for (; a.length && g < t; ) {
        var h = a.shift();
        h();
      }
    }
  }
  function l(h, x) {
    var d = r[h];
    d || (d = r[h] = []), d.push(x);
  }
  function u(h) {
    var x = r[h] || [];
    x.forEach((d) => d()), c();
  }
  function C(h, x) {
    if (!I) {
      var d = ze((H, ...v) => {
        if (g--, H === !1) {
          n = !0;
          return;
        }
        if (v.length < 2 && ([v] = v), H) {
          var N = {};
          if (Object.keys(B).forEach((M) => {
            N[M] = B[M];
          }), N[h] = v, I = !0, r = /* @__PURE__ */ Object.create(null), n)
            return;
          A(H, N);
        } else
          B[h] = v, u(h);
      });
      g++;
      var m = eA(x[x.length - 1]);
      x.length > 1 ? m(B, d) : m(d);
    }
  }
  function s() {
    for (var h, x = 0; Q.length; )
      h = Q.pop(), x++, f(h).forEach((d) => {
        --E[d] === 0 && Q.push(d);
      });
    if (x !== i)
      throw new Error(
        "async.auto cannot execute tasks due to a recursive dependency"
      );
  }
  function f(h) {
    var x = [];
    return Object.keys(e).forEach((d) => {
      const m = e[d];
      Array.isArray(m) && m.indexOf(h) >= 0 && x.push(d);
    }), x;
  }
  return A[xt];
}
var oa = /^(?:async\s+)?(?:function)?\s*\w*\s*\(\s*([^)]+)\s*\)(?:\s*{)/, aa = /^(?:async\s+)?\(?\s*([^)=]+)\s*\)?(?:\s*=>)/, sa = /,/, Ca = /(=.+)?(\s*)$/;
function ca(e) {
  let t = "", A = 0, i = e.indexOf("*/");
  for (; A < e.length; )
    if (e[A] === "/" && e[A + 1] === "/") {
      let B = e.indexOf(`
`, A);
      A = B === -1 ? e.length : B;
    } else if (i !== -1 && e[A] === "/" && e[A + 1] === "*") {
      let B = e.indexOf("*/", A);
      B !== -1 ? (A = B + 2, i = e.indexOf("*/", A)) : (t += e[A], A++);
    } else
      t += e[A], A++;
  return t;
}
function fa(e) {
  const t = ca(e.toString());
  let A = t.match(oa);
  if (A || (A = t.match(aa)), !A)
    throw new Error(`could not parse args in autoInject
Source:
` + t);
  let [, i] = A;
  return i.replace(/\s/g, "").split(sa).map((B) => B.replace(Ca, "").trim());
}
function GE(e, t) {
  var A = {};
  return Object.keys(e).forEach((i) => {
    var B = e[i], g, n = Yt(B), I = !n && B.length === 1 || n && B.length === 0;
    if (Array.isArray(B))
      g = [...B], B = g.pop(), A[i] = g.concat(g.length > 0 ? r : B);
    else if (I)
      A[i] = B;
    else {
      if (g = fa(B), B.length === 0 && !n && g.length === 0)
        throw new Error("autoInject task functions require explicit parameters.");
      n || g.pop(), A[i] = g.concat(r);
    }
    function r(a, Q) {
      var E = g.map((o) => a[o]);
      E.push(Q), eA(B)(...E);
    }
  }), _n(A, t);
}
class ua {
  constructor() {
    this.head = this.tail = null, this.length = 0;
  }
  removeLink(t) {
    return t.prev ? t.prev.next = t.next : this.head = t.next, t.next ? t.next.prev = t.prev : this.tail = t.prev, t.prev = t.next = null, this.length -= 1, t;
  }
  empty() {
    for (; this.head; )
      this.shift();
    return this;
  }
  insertAfter(t, A) {
    A.prev = t, A.next = t.next, t.next ? t.next.prev = A : this.tail = A, t.next = A, this.length += 1;
  }
  insertBefore(t, A) {
    A.prev = t.prev, A.next = t, t.prev ? t.prev.next = A : this.head = A, t.prev = A, this.length += 1;
  }
  unshift(t) {
    this.head ? this.insertBefore(this.head, t) : WI(this, t);
  }
  push(t) {
    this.tail ? this.insertAfter(this.tail, t) : WI(this, t);
  }
  shift() {
    return this.head && this.removeLink(this.head);
  }
  pop() {
    return this.tail && this.removeLink(this.tail);
  }
  toArray() {
    return [...this];
  }
  *[Symbol.iterator]() {
    for (var t = this.head; t; )
      yield t.data, t = t.next;
  }
  remove(t) {
    for (var A = this.head; A; ) {
      var { next: i } = A;
      t(A) && this.removeLink(A), A = i;
    }
    return this;
  }
}
function WI(e, t) {
  e.length = 1, e.head = e.tail = t;
}
function jn(e, t, A) {
  if (t == null)
    t = 1;
  else if (t === 0)
    throw new RangeError("Concurrency must not be zero");
  var i = eA(e), B = 0, g = [];
  const n = {
    error: [],
    drain: [],
    saturated: [],
    unsaturated: [],
    empty: []
  };
  function I(f, h) {
    n[f].push(h);
  }
  function r(f, h) {
    const x = (...d) => {
      a(f, x), h(...d);
    };
    n[f].push(x);
  }
  function a(f, h) {
    if (!f)
      return Object.keys(n).forEach((x) => n[x] = []);
    if (!h)
      return n[f] = [];
    n[f] = n[f].filter((x) => x !== h);
  }
  function Q(f, ...h) {
    n[f].forEach((x) => x(...h));
  }
  var E = !1;
  function o(f, h, x, d) {
    if (d != null && typeof d != "function")
      throw new Error("task callback must be a function");
    s.started = !0;
    var m, H;
    function v(M, ...Z) {
      if (M)
        return x ? H(M) : m();
      if (Z.length <= 1)
        return m(Z[0]);
      m(Z);
    }
    var N = s._createTaskItem(
      f,
      x ? v : d || v
    );
    if (h ? s._tasks.unshift(N) : s._tasks.push(N), E || (E = !0, Ze(() => {
      E = !1, s.process();
    })), x || !d)
      return new Promise((M, Z) => {
        m = M, H = Z;
      });
  }
  function c(f) {
    return function(h, ...x) {
      B -= 1;
      for (var d = 0, m = f.length; d < m; d++) {
        var H = f[d], v = g.indexOf(H);
        v === 0 ? g.shift() : v > 0 && g.splice(v, 1), H.callback(h, ...x), h != null && Q("error", h, H.data);
      }
      B <= s.concurrency - s.buffer && Q("unsaturated"), s.idle() && Q("drain"), s.process();
    };
  }
  function l(f) {
    return f.length === 0 && s.idle() ? (Ze(() => Q("drain")), !0) : !1;
  }
  const u = (f) => (h) => {
    if (!h)
      return new Promise((x, d) => {
        r(f, (m, H) => {
          if (m)
            return d(m);
          x(H);
        });
      });
    a(f), I(f, h);
  };
  var C = !1, s = {
    _tasks: new ua(),
    _createTaskItem(f, h) {
      return {
        data: f,
        callback: h
      };
    },
    *[Symbol.iterator]() {
      yield* s._tasks[Symbol.iterator]();
    },
    concurrency: t,
    payload: A,
    buffer: t / 4,
    started: !1,
    paused: !1,
    push(f, h) {
      return Array.isArray(f) ? l(f) ? void 0 : f.map((x) => o(x, !1, !1, h)) : o(f, !1, !1, h);
    },
    pushAsync(f, h) {
      return Array.isArray(f) ? l(f) ? void 0 : f.map((x) => o(x, !1, !0, h)) : o(f, !1, !0, h);
    },
    kill() {
      a(), s._tasks.empty();
    },
    unshift(f, h) {
      return Array.isArray(f) ? l(f) ? void 0 : f.map((x) => o(x, !0, !1, h)) : o(f, !0, !1, h);
    },
    unshiftAsync(f, h) {
      return Array.isArray(f) ? l(f) ? void 0 : f.map((x) => o(x, !0, !0, h)) : o(f, !0, !0, h);
    },
    remove(f) {
      s._tasks.remove(f);
    },
    process() {
      if (!C) {
        for (C = !0; !s.paused && B < s.concurrency && s._tasks.length; ) {
          var f = [], h = [], x = s._tasks.length;
          s.payload && (x = Math.min(x, s.payload));
          for (var d = 0; d < x; d++) {
            var m = s._tasks.shift();
            f.push(m), g.push(m), h.push(m.data);
          }
          B += 1, s._tasks.length === 0 && Q("empty"), B === s.concurrency && Q("saturated");
          var H = ze(c(f));
          i(h, H);
        }
        C = !1;
      }
    },
    length() {
      return s._tasks.length;
    },
    running() {
      return B;
    },
    workersList() {
      return g;
    },
    idle() {
      return s._tasks.length + B === 0;
    },
    pause() {
      s.paused = !0;
    },
    resume() {
      s.paused !== !1 && (s.paused = !1, Ze(s.process));
    }
  };
  return Object.defineProperties(s, {
    saturated: {
      writable: !1,
      value: u("saturated")
    },
    unsaturated: {
      writable: !1,
      value: u("unsaturated")
    },
    empty: {
      writable: !1,
      value: u("empty")
    },
    drain: {
      writable: !1,
      value: u("drain")
    },
    error: {
      writable: !1,
      value: u("error")
    }
  }), s;
}
function FE(e, t) {
  return jn(e, 1, t);
}
function RE(e, t, A) {
  return jn(e, t, A);
}
function xa(e, t, A, i) {
  i = Xe(i);
  var B = eA(A);
  return se(e, (g, n, I) => {
    B(t, g, (r, a) => {
      t = a, I(r);
    });
  }, (g) => i(g, t));
}
var Ve = AA(xa, 4);
function $n(...e) {
  var t = e.map(eA);
  return function(...A) {
    var i = this, B = A[A.length - 1];
    return typeof B == "function" ? A.pop() : B = ct(), Ve(
      t,
      A,
      (g, n, I) => {
        n.apply(i, g.concat((r, ...a) => {
          I(r, a);
        }));
      },
      (g, n) => B(g, ...n)
    ), B[xt];
  };
}
function SE(...e) {
  return $n(...e.reverse());
}
function ha(e, t, A, i) {
  return zn(Ce(t), e, A, i);
}
var Lt = AA(ha, 4);
function da(e, t, A, i) {
  var B = eA(A);
  return Lt(e, t, (g, n) => {
    B(g, (I, ...r) => I ? n(I) : n(I, r));
  }, (g, n) => {
    for (var I = [], r = 0; r < n.length; r++)
      n[r] && (I = I.concat(...n[r]));
    return i(g, I);
  });
}
var ft = AA(da, 4);
function la(e, t, A) {
  return ft(e, 1 / 0, t, A);
}
var ci = AA(la, 3);
function wa(e, t, A) {
  return ft(e, 1, t, A);
}
var fi = AA(wa, 3);
function bE(...e) {
  return function(...t) {
    var A = t.pop();
    return A(null, ...e);
  };
}
function Ue(e, t) {
  return (A, i, B, g) => {
    var n = !1, I;
    const r = eA(B);
    A(i, (a, Q, E) => {
      r(a, (o, c) => {
        if (o || o === !1)
          return E(o);
        if (e(c) && !I)
          return n = !0, I = t(!0, a), E(null, IB);
        E();
      });
    }, (a) => {
      if (a)
        return g(a);
      g(null, n ? I : t(!1));
    });
  };
}
function ya(e, t, A) {
  return Ue((i) => i, (i, B) => B)(HA, e, t, A);
}
var ui = AA(ya, 3);
function Da(e, t, A, i) {
  return Ue((B) => B, (B, g) => g)(Ce(t), e, A, i);
}
var xi = AA(Da, 4);
function pa(e, t, A) {
  return Ue((i) => i, (i, B) => B)(Ce(1), e, t, A);
}
var hi = AA(pa, 3);
function NE(e) {
  return (t, ...A) => eA(t)(...A, (i, ...B) => {
    typeof console == "object" && (i ? console.error && console.error(i) : console[e] && B.forEach((g) => console[e](g)));
  });
}
var UE = NE("dir");
function ma(e, t, A) {
  A = ze(A);
  var i = eA(e), B = eA(t), g;
  function n(r, ...a) {
    if (r)
      return A(r);
    r !== !1 && (g = a, B(...a, I));
  }
  function I(r, a) {
    if (r)
      return A(r);
    if (r !== !1) {
      if (!a)
        return A(null, ...g);
      i(n);
    }
  }
  return I(null, !0);
}
var Ft = AA(ma, 3);
function vE(e, t, A) {
  const i = eA(t);
  return Ft(e, (...B) => {
    const g = B.pop();
    i(...B, (n, I) => g(n, !I));
  }, A);
}
function HE(e) {
  return (t, A, i) => e(t, i);
}
function Ga(e, t, A) {
  return HA(e, HE(eA(t)), A);
}
var di = AA(Ga, 3);
function Fa(e, t, A, i) {
  return Ce(t)(e, HE(eA(A)), i);
}
var Rt = AA(Fa, 4);
function Ra(e, t, A) {
  return Rt(e, 1, t, A);
}
var St = AA(Ra, 3);
function AI(e) {
  return Yt(e) ? e : function(...t) {
    var A = t.pop(), i = !0;
    t.push((...B) => {
      i ? Ze(() => A(...B)) : A(...B);
    }), e.apply(this, t), i = !1;
  };
}
function Sa(e, t, A) {
  return Ue((i) => !i, (i) => !i)(HA, e, t, A);
}
var li = AA(Sa, 3);
function ba(e, t, A, i) {
  return Ue((B) => !B, (B) => !B)(Ce(t), e, A, i);
}
var wi = AA(ba, 4);
function Na(e, t, A) {
  return Ue((i) => !i, (i) => !i)(se, e, t, A);
}
var yi = AA(Na, 3);
function Ua(e, t, A, i) {
  var B = new Array(t.length);
  e(t, (g, n, I) => {
    A(g, (r, a) => {
      B[n] = !!a, I(r);
    });
  }, (g) => {
    if (g)
      return i(g);
    for (var n = [], I = 0; I < t.length; I++)
      B[I] && n.push(t[I]);
    i(null, n);
  });
}
function va(e, t, A, i) {
  var B = [];
  e(t, (g, n, I) => {
    A(g, (r, a) => {
      if (r)
        return I(r);
      a && B.push({ index: n, value: g }), I(r);
    });
  }, (g) => {
    if (g)
      return i(g);
    i(null, B.sort((n, I) => n.index - I.index).map((n) => n.value));
  });
}
function EB(e, t, A, i) {
  var B = nB(t) ? Ua : va;
  return B(e, t, eA(A), i);
}
function Ha(e, t, A) {
  return EB(HA, e, t, A);
}
var Di = AA(Ha, 3);
function Ya(e, t, A, i) {
  return EB(Ce(t), e, A, i);
}
var pi = AA(Ya, 4);
function La(e, t, A) {
  return EB(se, e, t, A);
}
var mi = AA(La, 3);
function Ma(e, t) {
  var A = ze(t), i = eA(AI(e));
  function B(g) {
    if (g)
      return A(g);
    g !== !1 && i(B);
  }
  return B();
}
var YE = AA(Ma, 2);
function ka(e, t, A, i) {
  var B = eA(A);
  return Lt(e, t, (g, n) => {
    B(g, (I, r) => I ? n(I) : n(I, { key: r, val: g }));
  }, (g, n) => {
    for (var I = {}, { hasOwnProperty: r } = Object.prototype, a = 0; a < n.length; a++)
      if (n[a]) {
        var { key: Q } = n[a], { val: E } = n[a];
        r.call(I, Q) ? I[Q].push(E) : I[Q] = [E];
      }
    return i(g, I);
  });
}
var QB = AA(ka, 4);
function LE(e, t, A) {
  return QB(e, 1 / 0, t, A);
}
function ME(e, t, A) {
  return QB(e, 1, t, A);
}
var kE = NE("log");
function Ka(e, t, A, i) {
  i = Xe(i);
  var B = {}, g = eA(A);
  return Ce(t)(e, (n, I, r) => {
    g(n, I, (a, Q) => {
      if (a)
        return r(a);
      B[I] = Q, r(a);
    });
  }, (n) => i(n, B));
}
var oB = AA(Ka, 4);
function KE(e, t, A) {
  return oB(e, 1 / 0, t, A);
}
function JE(e, t, A) {
  return oB(e, 1, t, A);
}
function WE(e, t = (A) => A) {
  var A = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null), B = eA(e), g = Ht((n, I) => {
    var r = t(...n);
    r in A ? Ze(() => I(null, ...A[r])) : r in i ? i[r].push(I) : (i[r] = [I], B(...n, (a, ...Q) => {
      a || (A[r] = Q);
      var E = i[r];
      delete i[r];
      for (var o = 0, c = E.length; o < c; o++)
        E[o](a, ...Q);
    }));
  });
  return g.memo = A, g.unmemoized = e, g;
}
var ti;
lE ? ti = process.nextTick : dE ? ti = setImmediate : ti = wE;
var qE = yE(ti), eI = AA((e, t, A) => {
  var i = nB(t) ? [] : {};
  e(t, (B, g, n) => {
    eA(B)((I, ...r) => {
      r.length < 2 && ([r] = r), i[g] = r, n(I);
    });
  }, (B) => A(B, i));
}, 3);
function ZE(e, t) {
  return eI(HA, e, t);
}
function VE(e, t, A) {
  return eI(Ce(t), e, A);
}
function tI(e, t) {
  var A = eA(e);
  return jn((i, B) => {
    A(i[0], B);
  }, t, 1);
}
class Ja {
  constructor() {
    this.heap = [], this.pushCount = Number.MIN_SAFE_INTEGER;
  }
  get length() {
    return this.heap.length;
  }
  empty() {
    return this.heap = [], this;
  }
  percUp(t) {
    let A;
    for (; t > 0 && OB(this.heap[t], this.heap[A = qI(t)]); ) {
      let i = this.heap[t];
      this.heap[t] = this.heap[A], this.heap[A] = i, t = A;
    }
  }
  percDown(t) {
    let A;
    for (; (A = Wa(t)) < this.heap.length && (A + 1 < this.heap.length && OB(this.heap[A + 1], this.heap[A]) && (A = A + 1), !OB(this.heap[t], this.heap[A])); ) {
      let i = this.heap[t];
      this.heap[t] = this.heap[A], this.heap[A] = i, t = A;
    }
  }
  push(t) {
    t.pushCount = ++this.pushCount, this.heap.push(t), this.percUp(this.heap.length - 1);
  }
  unshift(t) {
    return this.heap.push(t);
  }
  shift() {
    let [t] = this.heap;
    return this.heap[0] = this.heap[this.heap.length - 1], this.heap.pop(), this.percDown(0), t;
  }
  toArray() {
    return [...this];
  }
  *[Symbol.iterator]() {
    for (let t = 0; t < this.heap.length; t++)
      yield this.heap[t].data;
  }
  remove(t) {
    let A = 0;
    for (let i = 0; i < this.heap.length; i++)
      t(this.heap[i]) || (this.heap[A] = this.heap[i], A++);
    this.heap.splice(A);
    for (let i = qI(this.heap.length - 1); i >= 0; i--)
      this.percDown(i);
    return this;
  }
}
function Wa(e) {
  return (e << 1) + 1;
}
function qI(e) {
  return (e + 1 >> 1) - 1;
}
function OB(e, t) {
  return e.priority !== t.priority ? e.priority < t.priority : e.pushCount < t.pushCount;
}
function TE(e, t) {
  var A = tI(e, t), {
    push: i,
    pushAsync: B
  } = A;
  A._tasks = new Ja(), A._createTaskItem = ({ data: n, priority: I }, r) => ({
    data: n,
    priority: I,
    callback: r
  });
  function g(n, I) {
    return Array.isArray(n) ? n.map((r) => ({ data: r, priority: I })) : { data: n, priority: I };
  }
  return A.push = function(n, I = 0, r) {
    return i(g(n, I), r);
  }, A.pushAsync = function(n, I = 0, r) {
    return B(g(n, I), r);
  }, delete A.unshift, delete A.unshiftAsync, A;
}
function qa(e, t) {
  if (t = Xe(t), !Array.isArray(e))
    return t(new TypeError("First argument to race must be an array of functions"));
  if (!e.length)
    return t();
  for (var A = 0, i = e.length; A < i; A++)
    eA(e[A])(t);
}
var PE = AA(qa, 2);
function Gi(e, t, A, i) {
  var B = [...e].reverse();
  return Ve(B, t, A, i);
}
function Fi(e) {
  var t = eA(e);
  return Ht(function(i, B) {
    return i.push((g, ...n) => {
      let I = {};
      if (g && (I.error = g), n.length > 0) {
        var r = n;
        n.length <= 1 && ([r] = n), I.value = r;
      }
      B(null, I);
    }), t.apply(this, i);
  });
}
function XE(e) {
  var t;
  return Array.isArray(e) ? t = e.map(Fi) : (t = {}, Object.keys(e).forEach((A) => {
    t[A] = Fi.call(this, e[A]);
  })), t;
}
function iI(e, t, A, i) {
  const B = eA(A);
  return EB(e, t, (g, n) => {
    B(g, (I, r) => {
      n(I, !r);
    });
  }, i);
}
function Za(e, t, A) {
  return iI(HA, e, t, A);
}
var zE = AA(Za, 3);
function Va(e, t, A, i) {
  return iI(Ce(t), e, A, i);
}
var OE = AA(Va, 4);
function Ta(e, t, A) {
  return iI(se, e, t, A);
}
var _E = AA(Ta, 3);
function jE(e) {
  return function() {
    return e;
  };
}
const nn = 5, $E = 0;
function Ri(e, t, A) {
  var i = {
    times: nn,
    intervalFunc: jE($E)
  };
  if (arguments.length < 3 && typeof e == "function" ? (A = t || ct(), t = e) : (Pa(i, e), A = A || ct()), typeof t != "function")
    throw new Error("Invalid arguments for async.retry");
  var B = eA(t), g = 1;
  function n() {
    B((I, ...r) => {
      I !== !1 && (I && g++ < i.times && (typeof i.errorFilter != "function" || i.errorFilter(I)) ? setTimeout(n, i.intervalFunc(g - 1)) : A(I, ...r));
    });
  }
  return n(), A[xt];
}
function Pa(e, t) {
  if (typeof t == "object")
    e.times = +t.times || nn, e.intervalFunc = typeof t.interval == "function" ? t.interval : jE(+t.interval || $E), e.errorFilter = t.errorFilter;
  else if (typeof t == "number" || typeof t == "string")
    e.times = +t || nn;
  else
    throw new Error("Invalid arguments for async.retry");
}
function AQ(e, t) {
  t || (t = e, e = null);
  let A = e && e.arity || t.length;
  Yt(t) && (A += 1);
  var i = eA(t);
  return Ht((B, g) => {
    (B.length < A - 1 || g == null) && (B.push(g), g = ct());
    function n(I) {
      i(...B, I);
    }
    return e ? Ri(e, n, g) : Ri(n, g), g[xt];
  });
}
function eQ(e, t) {
  return eI(se, e, t);
}
function Xa(e, t, A) {
  return Ue(Boolean, (i) => i)(HA, e, t, A);
}
var Si = AA(Xa, 3);
function za(e, t, A, i) {
  return Ue(Boolean, (B) => B)(Ce(t), e, A, i);
}
var bi = AA(za, 4);
function Oa(e, t, A) {
  return Ue(Boolean, (i) => i)(se, e, t, A);
}
var Ni = AA(Oa, 3);
function _a(e, t, A) {
  var i = eA(t);
  return rB(e, (g, n) => {
    i(g, (I, r) => {
      if (I)
        return n(I);
      n(I, { value: g, criteria: r });
    });
  }, (g, n) => {
    if (g)
      return A(g);
    A(null, n.sort(B).map((I) => I.value));
  });
  function B(g, n) {
    var I = g.criteria, r = n.criteria;
    return I < r ? -1 : I > r ? 1 : 0;
  }
}
var tQ = AA(_a, 3);
function iQ(e, t, A) {
  var i = eA(e);
  return Ht((B, g) => {
    var n = !1, I;
    function r() {
      var a = e.name || "anonymous", Q = new Error('Callback function "' + a + '" timed out.');
      Q.code = "ETIMEDOUT", A && (Q.info = A), n = !0, g(Q);
    }
    B.push((...a) => {
      n || (g(...a), clearTimeout(I));
    }), I = setTimeout(r, t), i(...B);
  });
}
function ja(e) {
  for (var t = Array(e); e--; )
    t[e] = e;
  return t;
}
function aB(e, t, A, i) {
  var B = eA(A);
  return Lt(ja(e), t, B, i);
}
function BQ(e, t, A) {
  return aB(e, 1 / 0, t, A);
}
function gQ(e, t, A) {
  return aB(e, 1, t, A);
}
function nQ(e, t, A, i) {
  arguments.length <= 3 && typeof t == "function" && (i = A, A = t, t = Array.isArray(e) ? [] : {}), i = Xe(i || ct());
  var B = eA(A);
  return HA(e, (g, n, I) => {
    B(t, g, n, I);
  }, (g) => i(g, t)), i[xt];
}
function $a(e, t) {
  var A = null, i;
  return St(e, (B, g) => {
    eA(B)((n, ...I) => {
      if (n === !1)
        return g(n);
      I.length < 2 ? [i] = I : i = I, A = n, g(n ? null : {});
    });
  }, () => t(A, i));
}
var IQ = AA($a);
function rQ(e) {
  return (...t) => (e.unmemoized || e)(...t);
}
function As(e, t, A) {
  A = ze(A);
  var i = eA(t), B = eA(e), g = [];
  function n(r, ...a) {
    if (r)
      return A(r);
    g = a, r !== !1 && B(I);
  }
  function I(r, a) {
    if (r)
      return A(r);
    if (r !== !1) {
      if (!a)
        return A(null, ...g);
      i(n);
    }
  }
  return B(I);
}
var bt = AA(As, 3);
function EQ(e, t, A) {
  const i = eA(e);
  return bt((B) => i((g, n) => B(g, !n)), t, A);
}
function es(e, t) {
  if (t = Xe(t), !Array.isArray(e))
    return t(new Error("First argument to waterfall must be an array of functions"));
  if (!e.length)
    return t();
  var A = 0;
  function i(g) {
    var n = eA(e[A++]);
    n(...g, ze(B));
  }
  function B(g, ...n) {
    if (g !== !1) {
      if (g || A === e.length)
        return t(g, ...n);
      i(n);
    }
  }
  i([]);
}
var QQ = AA(es), ts = {
  apply: hE,
  applyEach: pE,
  applyEachSeries: mE,
  asyncify: Gt,
  auto: _n,
  autoInject: GE,
  cargo: FE,
  cargoQueue: RE,
  compose: SE,
  concat: ci,
  concatLimit: ft,
  concatSeries: fi,
  constant: bE,
  detect: ui,
  detectLimit: xi,
  detectSeries: hi,
  dir: UE,
  doUntil: vE,
  doWhilst: Ft,
  each: di,
  eachLimit: Rt,
  eachOf: HA,
  eachOfLimit: Ct,
  eachOfSeries: se,
  eachSeries: St,
  ensureAsync: AI,
  every: li,
  everyLimit: wi,
  everySeries: yi,
  filter: Di,
  filterLimit: pi,
  filterSeries: mi,
  forever: YE,
  groupBy: LE,
  groupByLimit: QB,
  groupBySeries: ME,
  log: kE,
  map: rB,
  mapLimit: Lt,
  mapSeries: On,
  mapValues: KE,
  mapValuesLimit: oB,
  mapValuesSeries: JE,
  memoize: WE,
  nextTick: qE,
  parallel: ZE,
  parallelLimit: VE,
  priorityQueue: TE,
  queue: tI,
  race: PE,
  reduce: Ve,
  reduceRight: Gi,
  reflect: Fi,
  reflectAll: XE,
  reject: zE,
  rejectLimit: OE,
  rejectSeries: _E,
  retry: Ri,
  retryable: AQ,
  seq: $n,
  series: eQ,
  setImmediate: Ze,
  some: Si,
  someLimit: bi,
  someSeries: Ni,
  sortBy: tQ,
  timeout: iQ,
  times: BQ,
  timesLimit: aB,
  timesSeries: gQ,
  transform: nQ,
  tryEach: IQ,
  unmemoize: rQ,
  until: EQ,
  waterfall: QQ,
  whilst: bt,
  // aliases
  all: li,
  allLimit: wi,
  allSeries: yi,
  any: Si,
  anyLimit: bi,
  anySeries: Ni,
  find: ui,
  findLimit: xi,
  findSeries: hi,
  flatMap: ci,
  flatMapLimit: ft,
  flatMapSeries: fi,
  forEach: di,
  forEachSeries: St,
  forEachLimit: Rt,
  forEachOf: HA,
  forEachOfSeries: se,
  forEachOfLimit: Ct,
  inject: Ve,
  foldl: Ve,
  foldr: Gi,
  select: Di,
  selectLimit: pi,
  selectSeries: mi,
  wrapSync: Gt,
  during: bt,
  doDuring: Ft
};
const is = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  all: li,
  allLimit: wi,
  allSeries: yi,
  any: Si,
  anyLimit: bi,
  anySeries: Ni,
  apply: hE,
  applyEach: pE,
  applyEachSeries: mE,
  asyncify: Gt,
  auto: _n,
  autoInject: GE,
  cargo: FE,
  cargoQueue: RE,
  compose: SE,
  concat: ci,
  concatLimit: ft,
  concatSeries: fi,
  constant: bE,
  default: ts,
  detect: ui,
  detectLimit: xi,
  detectSeries: hi,
  dir: UE,
  doDuring: Ft,
  doUntil: vE,
  doWhilst: Ft,
  during: bt,
  each: di,
  eachLimit: Rt,
  eachOf: HA,
  eachOfLimit: Ct,
  eachOfSeries: se,
  eachSeries: St,
  ensureAsync: AI,
  every: li,
  everyLimit: wi,
  everySeries: yi,
  filter: Di,
  filterLimit: pi,
  filterSeries: mi,
  find: ui,
  findLimit: xi,
  findSeries: hi,
  flatMap: ci,
  flatMapLimit: ft,
  flatMapSeries: fi,
  foldl: Ve,
  foldr: Gi,
  forEach: di,
  forEachLimit: Rt,
  forEachOf: HA,
  forEachOfLimit: Ct,
  forEachOfSeries: se,
  forEachSeries: St,
  forever: YE,
  groupBy: LE,
  groupByLimit: QB,
  groupBySeries: ME,
  inject: Ve,
  log: kE,
  map: rB,
  mapLimit: Lt,
  mapSeries: On,
  mapValues: KE,
  mapValuesLimit: oB,
  mapValuesSeries: JE,
  memoize: WE,
  nextTick: qE,
  parallel: ZE,
  parallelLimit: VE,
  priorityQueue: TE,
  queue: tI,
  race: PE,
  reduce: Ve,
  reduceRight: Gi,
  reflect: Fi,
  reflectAll: XE,
  reject: zE,
  rejectLimit: OE,
  rejectSeries: _E,
  retry: Ri,
  retryable: AQ,
  select: Di,
  selectLimit: pi,
  selectSeries: mi,
  seq: $n,
  series: eQ,
  setImmediate: Ze,
  some: Si,
  someLimit: bi,
  someSeries: Ni,
  sortBy: tQ,
  timeout: iQ,
  times: BQ,
  timesLimit: aB,
  timesSeries: gQ,
  transform: nQ,
  tryEach: IQ,
  unmemoize: rQ,
  until: EQ,
  waterfall: QQ,
  whilst: bt,
  wrapSync: Gt
}, Symbol.toStringTag, { value: "Module" })), BI = /* @__PURE__ */ Lo(is);
var _B, ZI;
function Bs() {
  if (ZI)
    return _B;
  ZI = 1;
  var e = Vn.spawn, t = BI, A = Ne();
  function i(B) {
    B._inputs[0].isStream || B.ffprobe(0, function(n, I) {
      B._ffprobeData = I;
    });
  }
  return _B = function(B) {
    B._spawnFfmpeg = function(g, n, I, r) {
      typeof n == "function" && (r = I, I = n, n = {}), typeof r > "u" && (r = I, I = function() {
      });
      var a = "stdoutLines" in n ? n.stdoutLines : this.options.stdoutLines;
      this._getFfmpegPath(function(Q, E) {
        if (Q)
          return r(Q);
        if (!E || E.length === 0)
          return r(new Error("Cannot find ffmpeg"));
        n.niceness && n.niceness !== 0 && !A.isWindows && (g.unshift("-n", n.niceness, E), E = "nice");
        var o = A.linesRing(a), c = !1, l = A.linesRing(a), u = !1, C = e(E, g, n);
        C.stderr && C.stderr.setEncoding("utf8"), C.on("error", function(x) {
          r(x);
        });
        var s = null;
        function f(x) {
          x && (s = x), h && (c || !n.captureStdout) && u && r(s, o, l);
        }
        var h = !1;
        C.on("exit", function(x, d) {
          h = !0, d ? f(new Error("ffmpeg was killed with signal " + d)) : x ? f(new Error("ffmpeg exited with code " + x)) : f();
        }), n.captureStdout && (C.stdout.on("data", function(x) {
          o.append(x);
        }), C.stdout.on("close", function() {
          o.close(), c = !0, f();
        })), C.stderr.on("data", function(x) {
          l.append(x);
        }), C.stderr.on("close", function() {
          l.close(), u = !0, f();
        }), I(C, o, l);
      });
    }, B._getArguments = function() {
      var g = this._complexFilters.get(), n = this._outputs.some(function(I) {
        return I.isFile;
      });
      return [].concat(
        // Inputs and input options
        this._inputs.reduce(function(I, r) {
          var a = typeof r.source == "string" ? r.source : "pipe:0";
          return I.concat(
            r.options.get(),
            ["-i", a]
          );
        }, []),
        // Global options
        this._global.get(),
        // Overwrite if we have file outputs
        n ? ["-y"] : [],
        // Complex filters
        g,
        // Outputs, filters and output options
        this._outputs.reduce(function(I, r) {
          var a = A.makeFilterStrings(r.sizeFilters.get()), Q = r.audioFilters.get(), E = r.videoFilters.get().concat(a), o;
          return r.target ? typeof r.target == "string" ? o = [r.target] : o = ["pipe:1"] : o = [], I.concat(
            r.audio.get(),
            Q.length ? ["-filter:a", Q.join(",")] : [],
            r.video.get(),
            E.length ? ["-filter:v", E.join(",")] : [],
            r.options.get(),
            o
          );
        }, [])
      );
    }, B._prepare = function(g, n) {
      var I = this;
      t.waterfall([
        // Check codecs and formats
        function(r) {
          I._checkCapabilities(r);
        },
        // Read metadata if required
        function(r) {
          if (!n)
            return r();
          I.ffprobe(0, function(a, Q) {
            a || (I._ffprobeData = Q), r();
          });
        },
        // Check for flvtool2/flvmeta if necessary
        function(r) {
          var a = I._outputs.some(function(Q) {
            return Q.flags.flvmeta && !Q.isFile && (I.logger.warn("Updating flv metadata is only supported for files"), Q.flags.flvmeta = !1), Q.flags.flvmeta;
          });
          a ? I._getFlvtoolPath(function(Q) {
            r(Q);
          }) : r();
        },
        // Build argument list
        function(r) {
          var a;
          try {
            a = I._getArguments();
          } catch (Q) {
            return r(Q);
          }
          r(null, a);
        },
        // Add "-strict experimental" option where needed
        function(r, a) {
          I.availableEncoders(function(Q, E) {
            for (var o = 0; o < r.length; o++)
              (r[o] === "-acodec" || r[o] === "-vcodec") && (o++, r[o] in E && E[r[o]].experimental && (r.splice(o + 1, 0, "-strict", "experimental"), o += 2));
            a(null, r);
          });
        }
      ], g), n || (this.listeners("progress").length > 0 ? i(this) : this.once("newListener", function(r) {
        r === "progress" && i(this);
      }));
    }, B.exec = B.execute = B.run = function() {
      var g = this, n = this._outputs.some(function(E) {
        return "target" in E;
      });
      if (!n)
        throw new Error("No output specified");
      var I = this._outputs.filter(function(E) {
        return typeof E.target != "string";
      })[0], r = this._inputs.filter(function(E) {
        return typeof E.source != "string";
      })[0], a = !1;
      function Q(E, o, c) {
        a || (a = !0, E ? g.emit("error", E, o, c) : g.emit("end", o, c));
      }
      g._prepare(function(E, o) {
        if (E)
          return Q(E);
        g._spawnFfmpeg(
          o,
          {
            captureStdout: !I,
            niceness: g.options.niceness,
            cwd: g.options.cwd
          },
          function(l, u, C) {
            if (g.ffmpegProc = l, g.emit("start", "ffmpeg " + o.join(" ")), r && (r.source.on("error", function(h) {
              var x = new Error("Input stream error: " + h.message);
              x.inputStreamError = h, Q(x), l.kill();
            }), r.source.resume(), r.source.pipe(l.stdin), l.stdin.on("error", function() {
            })), g.options.timeout && setTimeout(function() {
              var h = "process ran into a timeout (" + g.options.timeout + "s)";
              Q(new Error(h), u.get(), C.get()), l.kill();
            }, g.options.timeout * 1e3), I && (l.stdout.pipe(I.target, I.pipeopts), I.target.on("close", function() {
              g.logger.debug("Output stream closed, scheduling kill for ffmpeg process"), setTimeout(function() {
                Q(new Error("Output stream closed")), l.kill();
              }, 20);
            }), I.target.on("error", function(h) {
              g.logger.debug("Output stream error, killing ffmpeg process");
              var x = new Error("Output stream error: " + h.message);
              x.outputStreamError = h, Q(x, u.get(), C.get()), l.kill("SIGKILL");
            })), C) {
              if (g.listeners("stderr").length && C.callback(function(h) {
                g.emit("stderr", h);
              }), g.listeners("codecData").length) {
                var s = !1, f = {};
                C.callback(function(h) {
                  s || (s = A.extractCodecData(g, h, f));
                });
              }
              g.listeners("progress").length && C.callback(function(h) {
                A.extractProgress(g, h);
              });
            }
          },
          function(l, u, C) {
            if (delete g.ffmpegProc, l)
              l.message.match(/ffmpeg exited with code/) && (l.message += ": " + A.extractError(C.get())), Q(l, u.get(), C.get());
            else {
              var s = g._outputs.filter(function(f) {
                return f.flags.flvmeta;
              });
              s.length ? g._getFlvtoolPath(function(f, h) {
                if (f)
                  return Q(f);
                t.each(
                  s,
                  function(x, d) {
                    e(h, ["-U", x.target]).on("error", function(m) {
                      d(new Error("Error running " + h + " on " + x.target + ": " + m.message));
                    }).on("exit", function(m, H) {
                      m !== 0 || H ? d(
                        new Error(h + " " + (H ? "received signal " + H : "exited with code " + m)) + " when running on " + x.target
                      ) : d();
                    });
                  },
                  function(x) {
                    x ? Q(x) : Q(null, u.get(), C.get());
                  }
                );
              }) : Q(null, u.get(), C.get());
            }
          }
        );
      });
    }, B.renice = function(g) {
      if (!A.isWindows && (g = g || 0, (g < -20 || g > 20) && this.logger.warn("Invalid niceness value: " + g + ", must be between -20 and 20"), g = Math.min(20, Math.max(-20, g)), this.options.niceness = g, this.ffmpegProc)) {
        var n = this.logger, I = this.ffmpegProc.pid, r = e("renice", [g, "-p", I]);
        r.on("error", function(a) {
          n.warn("could not renice process " + I + ": " + a.message);
        }), r.on("exit", function(a, Q) {
          Q ? n.warn("could not renice process " + I + ": renice was killed by signal " + Q) : a ? n.warn("could not renice process " + I + ": renice exited with " + a) : n.info("successfully reniced process " + I + " to " + g + " niceness");
        });
      }
      return this;
    }, B.kill = function(g) {
      return this.ffmpegProc ? this.ffmpegProc.kill(g || "SIGKILL") : this.logger.warn("No running ffmpeg process, cannot send signal"), this;
    };
  }, _B;
}
var jB, VI;
function gs() {
  if (VI)
    return jB;
  VI = 1;
  var e = nA, t = vA, A = BI, i = Ne(), B = /^\s*([D ])([E ])([VAS])([S ])([D ])([T ]) ([^ ]+) +(.*)$/, g = /^\s*([D\.])([E\.])([VAS])([I\.])([L\.])([S\.]) ([^ ]+) +(.*)$/, n = /\(encoders:([^\)]+)\)/, I = /\(decoders:([^\)]+)\)/, r = /^\s*([VAS\.])([F\.])([S\.])([X\.])([B\.])([D\.]) ([^ ]+) +(.*)$/, a = /^\s*([D ])([E ]) ([^ ]+) +(.*)$/, Q = /\r\n|\r|\n/, E = /^(?: [T\.][S\.][C\.] )?([^ ]+) +(AA?|VV?|\|)->(AA?|VV?|\|) +(.*)$/, o = {};
  return jB = function(c) {
    c.setFfmpegPath = function(l) {
      return o.ffmpegPath = l, this;
    }, c.setFfprobePath = function(l) {
      return o.ffprobePath = l, this;
    }, c.setFlvtoolPath = function(l) {
      return o.flvtoolPath = l, this;
    }, c._forgetPaths = function() {
      delete o.ffmpegPath, delete o.ffprobePath, delete o.flvtoolPath;
    }, c._getFfmpegPath = function(l) {
      if ("ffmpegPath" in o)
        return l(null, o.ffmpegPath);
      A.waterfall([
        // Try FFMPEG_PATH
        function(u) {
          process.env.FFMPEG_PATH ? e.exists(process.env.FFMPEG_PATH, function(C) {
            C ? u(null, process.env.FFMPEG_PATH) : u(null, "");
          }) : u(null, "");
        },
        // Search in the PATH
        function(u, C) {
          if (u.length)
            return C(null, u);
          i.which("ffmpeg", function(s, f) {
            C(s, f);
          });
        }
      ], function(u, C) {
        u ? l(u) : l(null, o.ffmpegPath = C || "");
      });
    }, c._getFfprobePath = function(l) {
      var u = this;
      if ("ffprobePath" in o)
        return l(null, o.ffprobePath);
      A.waterfall([
        // Try FFPROBE_PATH
        function(C) {
          process.env.FFPROBE_PATH ? e.exists(process.env.FFPROBE_PATH, function(s) {
            C(null, s ? process.env.FFPROBE_PATH : "");
          }) : C(null, "");
        },
        // Search in the PATH
        function(C, s) {
          if (C.length)
            return s(null, C);
          i.which("ffprobe", function(f, h) {
            s(f, h);
          });
        },
        // Search in the same directory as ffmpeg
        function(C, s) {
          if (C.length)
            return s(null, C);
          u._getFfmpegPath(function(f, h) {
            if (f)
              s(f);
            else if (h.length) {
              var x = i.isWindows ? "ffprobe.exe" : "ffprobe", d = t.join(t.dirname(h), x);
              e.exists(d, function(m) {
                s(null, m ? d : "");
              });
            } else
              s(null, "");
          });
        }
      ], function(C, s) {
        C ? l(C) : l(null, o.ffprobePath = s || "");
      });
    }, c._getFlvtoolPath = function(l) {
      if ("flvtoolPath" in o)
        return l(null, o.flvtoolPath);
      A.waterfall([
        // Try FLVMETA_PATH
        function(u) {
          process.env.FLVMETA_PATH ? e.exists(process.env.FLVMETA_PATH, function(C) {
            u(null, C ? process.env.FLVMETA_PATH : "");
          }) : u(null, "");
        },
        // Try FLVTOOL2_PATH
        function(u, C) {
          if (u.length)
            return C(null, u);
          process.env.FLVTOOL2_PATH ? e.exists(process.env.FLVTOOL2_PATH, function(s) {
            C(null, s ? process.env.FLVTOOL2_PATH : "");
          }) : C(null, "");
        },
        // Search for flvmeta in the PATH
        function(u, C) {
          if (u.length)
            return C(null, u);
          i.which("flvmeta", function(s, f) {
            C(s, f);
          });
        },
        // Search for flvtool2 in the PATH
        function(u, C) {
          if (u.length)
            return C(null, u);
          i.which("flvtool2", function(s, f) {
            C(s, f);
          });
        }
      ], function(u, C) {
        u ? l(u) : l(null, o.flvtoolPath = C || "");
      });
    }, c.availableFilters = c.getAvailableFilters = function(l) {
      if ("filters" in o)
        return l(null, o.filters);
      this._spawnFfmpeg(["-filters"], { captureStdout: !0, stdoutLines: 0 }, function(u, C) {
        if (u)
          return l(u);
        var s = C.get(), f = s.split(`
`), h = {}, x = { A: "audio", V: "video", "|": "none" };
        f.forEach(function(d) {
          var m = d.match(E);
          m && (h[m[1]] = {
            description: m[4],
            input: x[m[2].charAt(0)],
            multipleInputs: m[2].length > 1,
            output: x[m[3].charAt(0)],
            multipleOutputs: m[3].length > 1
          });
        }), l(null, o.filters = h);
      });
    }, c.availableCodecs = c.getAvailableCodecs = function(l) {
      if ("codecs" in o)
        return l(null, o.codecs);
      this._spawnFfmpeg(["-codecs"], { captureStdout: !0, stdoutLines: 0 }, function(u, C) {
        if (u)
          return l(u);
        var s = C.get(), f = s.split(Q), h = {};
        f.forEach(function(x) {
          var d = x.match(B);
          if (d && d[7] !== "=" && (h[d[7]] = {
            type: { V: "video", A: "audio", S: "subtitle" }[d[3]],
            description: d[8],
            canDecode: d[1] === "D",
            canEncode: d[2] === "E",
            drawHorizBand: d[4] === "S",
            directRendering: d[5] === "D",
            weirdFrameTruncation: d[6] === "T"
          }), d = x.match(g), d && d[7] !== "=") {
            var m = h[d[7]] = {
              type: { V: "video", A: "audio", S: "subtitle" }[d[3]],
              description: d[8],
              canDecode: d[1] === "D",
              canEncode: d[2] === "E",
              intraFrameOnly: d[4] === "I",
              isLossy: d[5] === "L",
              isLossless: d[6] === "S"
            }, H = m.description.match(n);
            H = H ? H[1].trim().split(" ") : [];
            var v = m.description.match(I);
            if (v = v ? v[1].trim().split(" ") : [], H.length || v.length) {
              var N = {};
              i.copy(m, N), delete N.canEncode, delete N.canDecode, H.forEach(function(M) {
                h[M] = {}, i.copy(N, h[M]), h[M].canEncode = !0;
              }), v.forEach(function(M) {
                M in h || (h[M] = {}, i.copy(N, h[M])), h[M].canDecode = !0;
              });
            }
          }
        }), l(null, o.codecs = h);
      });
    }, c.availableEncoders = c.getAvailableEncoders = function(l) {
      if ("encoders" in o)
        return l(null, o.encoders);
      this._spawnFfmpeg(["-encoders"], { captureStdout: !0, stdoutLines: 0 }, function(u, C) {
        if (u)
          return l(u);
        var s = C.get(), f = s.split(Q), h = {};
        f.forEach(function(x) {
          var d = x.match(r);
          d && d[7] !== "=" && (h[d[7]] = {
            type: { V: "video", A: "audio", S: "subtitle" }[d[1]],
            description: d[8],
            frameMT: d[2] === "F",
            sliceMT: d[3] === "S",
            experimental: d[4] === "X",
            drawHorizBand: d[5] === "B",
            directRendering: d[6] === "D"
          });
        }), l(null, o.encoders = h);
      });
    }, c.availableFormats = c.getAvailableFormats = function(l) {
      if ("formats" in o)
        return l(null, o.formats);
      this._spawnFfmpeg(["-formats"], { captureStdout: !0, stdoutLines: 0 }, function(u, C) {
        if (u)
          return l(u);
        var s = C.get(), f = s.split(Q), h = {};
        f.forEach(function(x) {
          var d = x.match(a);
          d && d[3].split(",").forEach(function(m) {
            m in h || (h[m] = {
              description: d[4],
              canDemux: !1,
              canMux: !1
            }), d[1] === "D" && (h[m].canDemux = !0), d[2] === "E" && (h[m].canMux = !0);
          });
        }), l(null, o.formats = h);
      });
    }, c._checkCapabilities = function(l) {
      var u = this;
      A.waterfall([
        // Get available formats
        function(C) {
          u.availableFormats(C);
        },
        // Check whether specified formats are available
        function(C, s) {
          var f;
          if (f = u._outputs.reduce(function(h, x) {
            var d = x.options.find("-f", 1);
            return d && (!(d[0] in C) || !C[d[0]].canMux) && h.push(d), h;
          }, []), f.length === 1)
            return s(new Error("Output format " + f[0] + " is not available"));
          if (f.length > 1)
            return s(new Error("Output formats " + f.join(", ") + " are not available"));
          if (f = u._inputs.reduce(function(h, x) {
            var d = x.options.find("-f", 1);
            return d && (!(d[0] in C) || !C[d[0]].canDemux) && h.push(d[0]), h;
          }, []), f.length === 1)
            return s(new Error("Input format " + f[0] + " is not available"));
          if (f.length > 1)
            return s(new Error("Input formats " + f.join(", ") + " are not available"));
          s();
        },
        // Get available codecs
        function(C) {
          u.availableEncoders(C);
        },
        // Check whether specified codecs are available and add strict experimental options if needed
        function(C, s) {
          var f;
          if (f = u._outputs.reduce(function(h, x) {
            var d = x.audio.find("-acodec", 1);
            return d && d[0] !== "copy" && (!(d[0] in C) || C[d[0]].type !== "audio") && h.push(d[0]), h;
          }, []), f.length === 1)
            return s(new Error("Audio codec " + f[0] + " is not available"));
          if (f.length > 1)
            return s(new Error("Audio codecs " + f.join(", ") + " are not available"));
          if (f = u._outputs.reduce(function(h, x) {
            var d = x.video.find("-vcodec", 1);
            return d && d[0] !== "copy" && (!(d[0] in C) || C[d[0]].type !== "video") && h.push(d[0]), h;
          }, []), f.length === 1)
            return s(new Error("Video codec " + f[0] + " is not available"));
          if (f.length > 1)
            return s(new Error("Video codecs " + f.join(", ") + " are not available"));
          s();
        }
      ], l);
    };
  }, jB;
}
var $B, TI;
function ns() {
  if (TI)
    return $B;
  TI = 1;
  var e = Vn.spawn;
  function t(B) {
    return B.match(/^TAG:/);
  }
  function A(B) {
    return B.match(/^DISPOSITION:/);
  }
  function i(B) {
    var g = B.split(/\r\n|\r|\n/);
    g = g.filter(function(E) {
      return E.length > 0;
    });
    var n = {
      streams: [],
      format: {},
      chapters: []
    };
    function I(E) {
      for (var o = {}, c = g.shift(); typeof c < "u"; ) {
        if (c.toLowerCase() == "[/" + E + "]")
          return o;
        if (c.match(/^\[/)) {
          c = g.shift();
          continue;
        }
        var l = c.match(/^([^=]+)=(.*)$/);
        l && (!l[1].match(/^TAG:/) && l[2].match(/^[0-9]+(\.[0-9]+)?$/) ? o[l[1]] = Number(l[2]) : o[l[1]] = l[2]), c = g.shift();
      }
      return o;
    }
    for (var r = g.shift(); typeof r < "u"; ) {
      if (r.match(/^\[stream/i)) {
        var a = I("stream");
        n.streams.push(a);
      } else if (r.match(/^\[chapter/i)) {
        var Q = I("chapter");
        n.chapters.push(Q);
      } else
        r.toLowerCase() === "[format]" && (n.format = I("format"));
      r = g.shift();
    }
    return n;
  }
  return $B = function(B) {
    B.ffprobe = function() {
      var g, n = null, I = [], r, r = arguments[arguments.length - 1], a = !1;
      function Q(E, o) {
        a || (a = !0, r(E, o));
      }
      switch (arguments.length) {
        case 3:
          n = arguments[0], I = arguments[1];
          break;
        case 2:
          typeof arguments[0] == "number" ? n = arguments[0] : Array.isArray(arguments[0]) && (I = arguments[0]);
          break;
      }
      if (n === null) {
        if (!this._currentInput)
          return Q(new Error("No input specified"));
        g = this._currentInput;
      } else if (g = this._inputs[n], !g)
        return Q(new Error("Invalid input index"));
      this._getFfprobePath(function(E, o) {
        if (E)
          return Q(E);
        if (!o)
          return Q(new Error("Cannot find ffprobe"));
        var c = "", l = !1, u = "", C = !1, s = g.isStream ? "pipe:0" : g.source, f = e(o, ["-show_streams", "-show_format"].concat(I, s));
        g.isStream && (f.stdin.on("error", function(m) {
          ["ECONNRESET", "EPIPE"].indexOf(m.code) >= 0 || Q(m);
        }), f.stdin.on("close", function() {
          g.source.pause(), g.source.unpipe(f.stdin);
        }), g.source.pipe(f.stdin)), f.on("error", r);
        var h = null;
        function x(m) {
          if (m && (h = m), d && l && C) {
            if (h)
              return u && (h.message += `
` + u), Q(h);
            var H = i(c);
            [H.format].concat(H.streams).forEach(function(v) {
              if (v) {
                var N = Object.keys(v).filter(t);
                N.length && (v.tags = v.tags || {}, N.forEach(function(Z) {
                  v.tags[Z.substr(4)] = v[Z], delete v[Z];
                }));
                var M = Object.keys(v).filter(A);
                M.length && (v.disposition = v.disposition || {}, M.forEach(function(Z) {
                  v.disposition[Z.substr(12)] = v[Z], delete v[Z];
                }));
              }
            }), Q(null, H);
          }
        }
        var d = !1;
        f.on("exit", function(m, H) {
          d = !0, m ? x(new Error("ffprobe exited with code " + m)) : H ? x(new Error("ffprobe was killed with signal " + H)) : x();
        }), f.stdout.on("data", function(m) {
          c += m;
        }), f.stdout.on("close", function() {
          l = !0, x();
        }), f.stderr.on("data", function(m) {
          u += m;
        }), f.stderr.on("close", function() {
          C = !0, x();
        });
      });
    };
  }, $B;
}
var Ag, PI;
function Is() {
  if (PI)
    return Ag;
  PI = 1;
  var e = nA, t = vA, A = ao.PassThrough, i = BI, B = Ne();
  return Ag = function(n) {
    n.saveToFile = n.save = function(I) {
      return this.output(I).run(), this;
    }, n.writeToStream = n.pipe = n.stream = function(I, r) {
      if (I && !("writable" in I) && (r = I, I = void 0), !I) {
        if (process.version.match(/v0\.8\./))
          throw new Error("PassThrough stream is not supported on node v0.8");
        I = new A();
      }
      return this.output(I, r).run(), I;
    }, n.takeScreenshots = n.thumbnail = n.thumbnails = n.screenshot = n.screenshots = function(I, r) {
      var a = this, Q = this._currentInput.source;
      if (I = I || { count: 1 }, typeof I == "number" && (I = {
        count: I
      }), "folder" in I || (I.folder = r || "."), "timestamps" in I && (I.timemarks = I.timestamps), !("timemarks" in I)) {
        if (!I.count)
          throw new Error("Cannot take screenshots: neither a count nor a timemark list are specified");
        var E = 100 / (1 + I.count);
        I.timemarks = [];
        for (var o = 0; o < I.count; o++)
          I.timemarks.push(E * (o + 1) + "%");
      }
      if ("size" in I) {
        var c = I.size.match(/^(\d+)x(\d+)$/), l = I.size.match(/^(\d+)x\?$/), u = I.size.match(/^\?x(\d+)$/), C = I.size.match(/^(\d+)%$/);
        if (!c && !l && !u && !C)
          throw new Error("Invalid size parameter: " + I.size);
      }
      var s;
      function f(h) {
        s ? h(null, s) : a.ffprobe(function(x, d) {
          s = d, h(x, d);
        });
      }
      return i.waterfall([
        // Compute percent timemarks if any
        function(x) {
          if (I.timemarks.some(function(d) {
            return ("" + d).match(/^[\d.]+%$/);
          })) {
            if (typeof Q != "string")
              return x(new Error("Cannot compute screenshot timemarks with an input stream, please specify fixed timemarks"));
            f(function(d, m) {
              if (d)
                x(d);
              else {
                var H = m.streams.reduce(function(N, M) {
                  return M.codec_type === "video" && M.width * M.height > N.width * N.height ? M : N;
                }, { width: 0, height: 0 });
                if (H.width === 0)
                  return x(new Error("No video stream in input, cannot take screenshots"));
                var v = Number(H.duration);
                if (isNaN(v) && (v = Number(m.format.duration)), isNaN(v))
                  return x(new Error("Could not get input duration, please specify fixed timemarks"));
                I.timemarks = I.timemarks.map(function(N) {
                  return ("" + N).match(/^([\d.]+)%$/) ? v * parseFloat(N) / 100 : N;
                }), x();
              }
            });
          } else
            x();
        },
        // Turn all timemarks into numbers and sort them
        function(x) {
          I.timemarks = I.timemarks.map(function(d) {
            return B.timemarkToSeconds(d);
          }).sort(function(d, m) {
            return d - m;
          }), x();
        },
        // Add '_%i' to pattern when requesting multiple screenshots and no variable token is present
        function(x) {
          var d = I.filename || "tn.png";
          if (d.indexOf(".") === -1 && (d += ".png"), I.timemarks.length > 1 && !d.match(/%(s|0*i)/)) {
            var m = t.extname(d);
            d = t.join(t.dirname(d), t.basename(d, m) + "_%i" + m);
          }
          x(null, d);
        },
        // Replace filename tokens (%f, %b) in pattern
        function(x, d) {
          if (x.match(/%[bf]/)) {
            if (typeof Q != "string")
              return d(new Error("Cannot replace %f or %b when using an input stream"));
            x = x.replace(/%f/g, t.basename(Q)).replace(/%b/g, t.basename(Q, t.extname(Q)));
          }
          d(null, x);
        },
        // Compute size if needed
        function(x, d) {
          if (x.match(/%[whr]/)) {
            if (c)
              return d(null, x, c[1], c[2]);
            f(function(m, H) {
              if (m)
                return d(new Error("Could not determine video resolution to replace %w, %h or %r"));
              var v = H.streams.reduce(function(Z, V) {
                return V.codec_type === "video" && V.width * V.height > Z.width * Z.height ? V : Z;
              }, { width: 0, height: 0 });
              if (v.width === 0)
                return d(new Error("No video stream in input, cannot replace %w, %h or %r"));
              var N = v.width, M = v.height;
              l ? (M = M * Number(l[1]) / N, N = Number(l[1])) : u ? (N = N * Number(u[1]) / M, M = Number(u[1])) : C && (N = N * Number(C[1]) / 100, M = M * Number(C[1]) / 100), d(null, x, Math.round(N / 2) * 2, Math.round(M / 2) * 2);
            });
          } else
            d(null, x, -1, -1);
        },
        // Replace size tokens (%w, %h, %r) in pattern
        function(x, d, m, H) {
          x = x.replace(/%r/g, "%wx%h").replace(/%w/g, d).replace(/%h/g, m), H(null, x);
        },
        // Replace variable tokens in pattern (%s, %i) and generate filename list
        function(x, d) {
          var m = I.timemarks.map(function(H, v) {
            return x.replace(/%s/g, B.timemarkToSeconds(H)).replace(/%(0*)i/g, function(N, M) {
              var Z = "" + (v + 1);
              return M.substr(0, Math.max(0, M.length + 1 - Z.length)) + Z;
            });
          });
          a.emit("filenames", m), d(null, m);
        },
        // Create output directory
        function(x, d) {
          e.exists(I.folder, function(m) {
            m ? d(null, x) : e.mkdir(I.folder, function(H) {
              H ? d(H) : d(null, x);
            });
          });
        }
      ], function(x, d) {
        if (x)
          return a.emit("error", x);
        var m = I.timemarks.length, H, v = [H = {
          filter: "split",
          options: m,
          outputs: []
        }];
        if ("size" in I) {
          a.size(I.size);
          var N = a._currentOutput.sizeFilters.get().map(function(EA, _) {
            return _ > 0 && (EA.inputs = "size" + (_ - 1)), EA.outputs = "size" + _, EA;
          });
          H.inputs = "size" + (N.length - 1), v = N.concat(v), a._currentOutput.sizeFilters.clear();
        }
        for (var M = 0, Z = 0; Z < m; Z++) {
          var V = "screen" + Z;
          H.outputs.push(V), Z === 0 && (M = I.timemarks[Z], a.seekInput(M)), a.output(t.join(I.folder, d[Z])).frames(1).map(V), Z > 0 && a.seek(I.timemarks[Z] - M);
        }
        a.complexFilter(v), a.run();
      }), this;
    }, n.mergeToFile = n.concatenate = n.concat = function(I, r) {
      var a = this._inputs.filter(function(E) {
        return !E.isStream;
      })[0], Q = this;
      return this.ffprobe(this._inputs.indexOf(a), function(E, o) {
        if (E)
          return Q.emit("error", E);
        var c = o.streams.some(function(u) {
          return u.codec_type === "audio";
        }), l = o.streams.some(function(u) {
          return u.codec_type === "video";
        });
        Q.output(I, r).complexFilter({
          filter: "concat",
          options: {
            n: Q._inputs.length,
            v: l ? 1 : 0,
            a: c ? 1 : 0
          }
        }).run();
      }), this;
    };
  }, Ag;
}
var eg, XI;
function zI() {
  if (XI)
    return eg;
  XI = 1;
  var e = vA, t = Bt, A = Ut.EventEmitter, i = Ne();
  function B(g, n) {
    if (!(this instanceof B))
      return new B(g, n);
    A.call(this), typeof g == "object" && !("readable" in g) ? n = g : (n = n || {}, n.source = g), this._inputs = [], n.source && this.input(n.source), this._outputs = [], this.output();
    var I = this;
    ["_global", "_complexFilters"].forEach(function(r) {
      I[r] = i.args();
    }), n.stdoutLines = "stdoutLines" in n ? n.stdoutLines : 100, n.presets = n.presets || n.preset || e.join(__dirname, "presets"), n.niceness = n.niceness || n.priority || 0, this.options = n, this.logger = n.logger || {
      debug: function() {
      },
      info: function() {
      },
      warn: function() {
      },
      error: function() {
      }
    };
  }
  return t.inherits(B, A), eg = B, B.prototype.clone = function() {
    var g = new B(), n = this;
    return g.options = this.options, g.logger = this.logger, g._inputs = this._inputs.map(function(I) {
      return {
        source: I.source,
        options: I.options.clone()
      };
    }), "target" in this._outputs[0] ? (g._outputs = [], g.output()) : (g._outputs = [
      g._currentOutput = {
        flags: {}
      }
    ], ["audio", "audioFilters", "video", "videoFilters", "sizeFilters", "options"].forEach(function(I) {
      g._currentOutput[I] = n._currentOutput[I].clone();
    }), this._currentOutput.sizeData && (g._currentOutput.sizeData = {}, i.copy(this._currentOutput.sizeData, g._currentOutput.sizeData)), i.copy(this._currentOutput.flags, g._currentOutput.flags)), ["_global", "_complexFilters"].forEach(function(I) {
      g[I] = n[I].clone();
    }), g;
  }, Wo()(B.prototype), qo()(B.prototype), Zo()(B.prototype), Vo()(B.prototype), To()(B.prototype), Po()(B.prototype), Xo()(B.prototype), Bs()(B.prototype), gs()(B.prototype), B.setFfmpegPath = function(g) {
    new B().setFfmpegPath(g);
  }, B.setFfprobePath = function(g) {
    new B().setFfprobePath(g);
  }, B.setFlvtoolPath = function(g) {
    new B().setFlvtoolPath(g);
  }, B.availableFilters = B.getAvailableFilters = function(g) {
    new B().availableFilters(g);
  }, B.availableCodecs = B.getAvailableCodecs = function(g) {
    new B().availableCodecs(g);
  }, B.availableFormats = B.getAvailableFormats = function(g) {
    new B().availableFormats(g);
  }, B.availableEncoders = B.getAvailableEncoders = function(g) {
    new B().availableEncoders(g);
  }, ns()(B.prototype), B.ffprobe = function(g) {
    var n = new B(g);
    n.ffprobe.apply(n, Array.prototype.slice.call(arguments, 1));
  }, Is()(B.prototype), eg;
}
var rs = (process.env.FLUENTFFMPEG_COV, zI());
const In = /* @__PURE__ */ gB(rs);
function BA(...e) {
  console.log(...e);
}
var oQ = { exports: {} }, rn = { exports: {} }, Tt = vA.sep || "/", Es = Qs;
function Qs(e) {
  if (typeof e != "string" || e.length <= 7 || e.substring(0, 7) != "file://")
    throw new TypeError("must pass in a file:// URI to convert to a file path");
  var t = decodeURI(e.substring(7)), A = t.indexOf("/"), i = t.substring(0, A), B = t.substring(A + 1);
  return i == "localhost" && (i = ""), i && (i = Tt + Tt + i), B = B.replace(/^(.+)\|/, "$1:"), Tt == "\\" && (B = B.replace(/\//g, "\\")), /^.+\:/.test(B) || (B = Tt + B), i + B;
}
(function(e, t) {
  var A = nA, i = vA, B = Es, g = i.join, n = i.dirname, I = A.accessSync && function(Q) {
    try {
      A.accessSync(Q);
    } catch {
      return !1;
    }
    return !0;
  } || A.existsSync || i.existsSync, r = {
    arrow: process.env.NODE_BINDINGS_ARROW || " → ",
    compiled: process.env.NODE_BINDINGS_COMPILED_DIR || "compiled",
    platform: process.platform,
    arch: process.arch,
    nodePreGyp: "node-v" + process.versions.modules + "-" + process.platform + "-" + process.arch,
    version: process.versions.node,
    bindings: "bindings.node",
    try: [
      // node-gyp's linked version in the "build" dir
      ["module_root", "build", "bindings"],
      // node-waf and gyp_addon (a.k.a node-gyp)
      ["module_root", "build", "Debug", "bindings"],
      ["module_root", "build", "Release", "bindings"],
      // Debug files, for development (legacy behavior, remove for node v0.9)
      ["module_root", "out", "Debug", "bindings"],
      ["module_root", "Debug", "bindings"],
      // Release files, but manually compiled (legacy behavior, remove for node v0.9)
      ["module_root", "out", "Release", "bindings"],
      ["module_root", "Release", "bindings"],
      // Legacy from node-waf, node <= 0.4.x
      ["module_root", "build", "default", "bindings"],
      // Production "Release" buildtype binary (meh...)
      ["module_root", "compiled", "version", "platform", "arch", "bindings"],
      // node-qbs builds
      ["module_root", "addon-build", "release", "install-root", "bindings"],
      ["module_root", "addon-build", "debug", "install-root", "bindings"],
      ["module_root", "addon-build", "default", "install-root", "bindings"],
      // node-pre-gyp path ./lib/binding/{node_abi}-{platform}-{arch}
      ["module_root", "lib", "binding", "nodePreGyp", "bindings"]
    ]
  };
  function a(Q) {
    typeof Q == "string" ? Q = { bindings: Q } : Q || (Q = {}), Object.keys(r).map(function(f) {
      f in Q || (Q[f] = r[f]);
    }), Q.module_root || (Q.module_root = t.getRoot(t.getFileName())), i.extname(Q.bindings) != ".node" && (Q.bindings += ".node");
    for (var E = typeof __webpack_require__ == "function" ? __non_webpack_require__ : Xn, o = [], c = 0, l = Q.try.length, u, C, s; c < l; c++) {
      u = g.apply(
        null,
        Q.try[c].map(function(f) {
          return Q[f] || f;
        })
      ), o.push(u);
      try {
        return C = Q.path ? E.resolve(u) : E(u), Q.path || (C.path = u), C;
      } catch (f) {
        if (f.code !== "MODULE_NOT_FOUND" && f.code !== "QUALIFIED_PATH_RESOLUTION_FAILED" && !/not find/i.test(f.message))
          throw f;
      }
    }
    throw s = new Error(
      `Could not locate the bindings file. Tried:
` + o.map(function(f) {
        return Q.arrow + f;
      }).join(`
`)
    ), s.tries = o, s;
  }
  e.exports = t = a, t.getFileName = function(E) {
    var o = Error.prepareStackTrace, c = Error.stackTraceLimit, l = {}, u;
    Error.stackTraceLimit = 10, Error.prepareStackTrace = function(s, f) {
      for (var h = 0, x = f.length; h < x; h++)
        if (u = f[h].getFileName(), u !== __filename)
          if (E) {
            if (u !== E)
              return;
          } else
            return;
    }, Error.captureStackTrace(l), l.stack, Error.prepareStackTrace = o, Error.stackTraceLimit = c;
    var C = "file://";
    return u.indexOf(C) === 0 && (u = B(u)), u;
  }, t.getRoot = function(E) {
    for (var o = n(E), c; ; ) {
      if (o === "." && (o = process.cwd()), I(g(o, "package.json")) || I(g(o, "node_modules")))
        return o;
      if (c === o)
        throw new Error(
          'Could not find module root given file: "' + E + '". Do you have a `package.json` file? '
        );
      c = o, o = g(o, "..");
    }
  };
})(rn, rn.exports);
var os = rn.exports, as = os("node_sqlite3.node"), tg = {}, OI;
function ss() {
  if (OI)
    return tg;
  OI = 1;
  const e = Bt;
  function t(i, B, g) {
    const n = i[B];
    i[B] = function() {
      const I = new Error(), r = i.constructor.name + "#" + B + "(" + Array.prototype.slice.call(arguments).map(function(Q) {
        return e.inspect(Q, !1, 0);
      }).join(", ") + ")";
      typeof g > "u" && (g = -1), g < 0 && (g += arguments.length);
      const a = arguments[g];
      return typeof arguments[g] == "function" && (arguments[g] = function() {
        const E = arguments[0];
        return E && E.stack && !E.__augmented && (E.stack = A(E).join(`
`), E.stack += `
--> in ` + r, E.stack += `
` + A(I).slice(1).join(`
`), E.__augmented = !0), a.apply(this, arguments);
      }), n.apply(this, arguments);
    };
  }
  tg.extendTrace = t;
  function A(i) {
    return i.stack.split(`
`).filter(function(B) {
      return B.indexOf(__filename) < 0;
    });
  }
  return tg;
}
(function(e, t) {
  const A = vA, i = as, B = Ut.EventEmitter;
  e.exports = i;
  function g(o) {
    return function(c) {
      let l;
      const u = Array.prototype.slice.call(arguments, 1);
      if (typeof u[u.length - 1] == "function") {
        const s = u[u.length - 1];
        l = function(f) {
          f && s(f);
        };
      }
      const C = new r(this, c, l);
      return o.call(this, C, u);
    };
  }
  function n(o, c) {
    for (const l in c.prototype)
      o.prototype[l] = c.prototype[l];
  }
  i.cached = {
    Database: function(o, c, l) {
      if (o === "" || o === ":memory:")
        return new I(o, c, l);
      let u;
      if (o = A.resolve(o), !i.cached.objects[o])
        u = i.cached.objects[o] = new I(o, c, l);
      else {
        u = i.cached.objects[o];
        const C = typeof c == "number" ? l : c;
        if (typeof C == "function") {
          let s = function() {
            C.call(u, null);
          };
          u.open ? process.nextTick(s) : u.once("open", s);
        }
      }
      return u;
    },
    objects: {}
  };
  const I = i.Database, r = i.Statement, a = i.Backup;
  n(I, B), n(r, B), n(a, B), I.prototype.prepare = g(function(o, c) {
    return c.length ? o.bind.apply(o, c) : o;
  }), I.prototype.run = g(function(o, c) {
    return o.run.apply(o, c).finalize(), this;
  }), I.prototype.get = g(function(o, c) {
    return o.get.apply(o, c).finalize(), this;
  }), I.prototype.all = g(function(o, c) {
    return o.all.apply(o, c).finalize(), this;
  }), I.prototype.each = g(function(o, c) {
    return o.each.apply(o, c).finalize(), this;
  }), I.prototype.map = g(function(o, c) {
    return o.map.apply(o, c).finalize(), this;
  }), I.prototype.backup = function() {
    let o;
    return arguments.length <= 2 ? o = new a(this, arguments[0], "main", "main", !0, arguments[1]) : o = new a(this, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]), o.retryErrors = [i.BUSY, i.LOCKED], o;
  }, r.prototype.map = function() {
    const o = Array.prototype.slice.call(arguments), c = o.pop();
    return o.push(function(l, u) {
      if (l)
        return c(l);
      const C = {};
      if (u.length) {
        const s = Object.keys(u[0]), f = s[0];
        if (s.length > 2)
          for (let h = 0; h < u.length; h++)
            C[u[h][f]] = u[h];
        else {
          const h = s[1];
          for (let x = 0; x < u.length; x++)
            C[u[x][f]] = u[x][h];
        }
      }
      c(l, C);
    }), this.all.apply(this, o);
  };
  let Q = !1;
  const E = ["trace", "profile", "change"];
  I.prototype.addListener = I.prototype.on = function(o) {
    const c = B.prototype.addListener.apply(this, arguments);
    return E.indexOf(o) >= 0 && this.configure(o, !0), c;
  }, I.prototype.removeListener = function(o) {
    const c = B.prototype.removeListener.apply(this, arguments);
    return E.indexOf(o) >= 0 && !this._events[o] && this.configure(o, !1), c;
  }, I.prototype.removeAllListeners = function(o) {
    const c = B.prototype.removeAllListeners.apply(this, arguments);
    return E.indexOf(o) >= 0 && this.configure(o, !1), c;
  }, i.verbose = function() {
    if (!Q) {
      const o = ss();
      [
        "prepare",
        "get",
        "run",
        "all",
        "each",
        "map",
        "close",
        "exec"
      ].forEach(function(c) {
        o.extendTrace(I.prototype, c);
      }), [
        "bind",
        "get",
        "run",
        "all",
        "each",
        "map",
        "reset",
        "finalize"
      ].forEach(function(c) {
        o.extendTrace(r.prototype, c);
      }), Q = !0;
    }
    return i;
  };
})(oQ);
var Cs = oQ.exports;
const ig = /* @__PURE__ */ gB(Cs);
class cs {
  constructor() {
    O(this, "db");
  }
  createConnection(t) {
    this.db || (this.db = new ig.Database(t, ig.OPEN_READWRITE | ig.OPEN_CREATE, (A) => {
      if (A) {
        BA("Could not connect to database", A);
        return;
      }
      this.createTable();
    }));
  }
  createTable() {
    throw new Error("Method not implemented.");
  }
  close() {
    var t;
    (t = this.db) == null || t.close();
  }
}
class fs extends cs {
  constructor() {
    super();
    O(this, "msgCache", /* @__PURE__ */ new Map());
    const A = 1e3 * 60 * 10;
    setInterval(() => {
      BA("清理消息缓存"), this.msgCache.forEach((i, B) => {
        Date.now() - parseInt(i.msgTime) * 1e3 > A && this.msgCache.delete(B);
      });
    }, A);
  }
  createTable() {
    this.db.run(`
            CREATE TABLE IF NOT EXISTS msgs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                long_id TEXT NOT NULL UNIQUE,
                seq INTEGER NOT NULL,
                peer_uid TEXT NOT NULL,
                msg TEXT NOT NULL
            )`, function(g) {
      g && BA("Could not create table", g);
    }), this.db.run(`
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                path TEXT NOT NULL,
                url TEXT,
                size INTEGER NOT NULL,
                uuid TEXT,
                elementType INTEGER,
                element TEXT NOT NULL,
                elementId TEXT NOT NULL,
                msgId TEXT NOT NULL
            )`, function(g) {
      g && BA("Could not create table files", g);
    }), this.db.run(`
            CREATE TABLE IF NOT EXISTS temp_uins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uid TEXT,
                uin TEXT
            )`, function(g) {
      g && BA("Could not create table temp_uins", g);
    });
  }
  async getMsg(A, i) {
    const B = this.db.prepare(A);
    return new Promise((g, n) => {
      B.get(...i, (I, r) => {
        I && (BA("Could not get msg by short id", I), g(null));
        try {
          const a = JSON.parse(r.msg);
          return a.id = r.id, g(a);
        } catch {
          return g(null);
        }
      });
    });
  }
  async getMsgByShortId(A) {
    return this.getMsg("SELECT * FROM msgs WHERE id = ?", [A]);
  }
  async getMsgByLongId(A) {
    return this.msgCache.has(A) ? this.msgCache.get(A) : this.getMsg("SELECT * FROM msgs WHERE long_id = ?", [A]);
  }
  async getMsgBySeq(A, i) {
    return this.getMsg("SELECT * FROM msgs WHERE peer_uid = ? AND seq = ?", [A, i]);
  }
  async addMsg(A, i = !0) {
    BA("正在记录消息到数据库", A.msgId);
    const B = await this.getMsgByLongId(A.msgId);
    if (B)
      return i && this.updateMsg(A).then(), B.id;
    const g = this.db.prepare("INSERT INTO msgs (long_id, seq, peer_uid, msg) VALUES (?, ?, ?, ?)");
    return new Promise((n, I) => {
      const r = this;
      g.run(A.msgId, A.msgSeq, A.peerUid, JSON.stringify(A), function(a) {
        a ? a.errno === 19 ? r.getMsgByLongId(A.msgId).then((Q) => {
          Q ? (r.msgCache.set(Q.msgId, Q), n(Q.id)) : (BA("db could not get msg by long id", a), n(-1));
        }) : (BA("db could not add msg", a), n(-1)) : (A.id = this.lastID, r.msgCache.set(A.msgId, A), n(this.lastID));
      });
    });
  }
  async updateMsg(A) {
    const i = this.msgCache.get(A.msgId);
    i && Object.assign(i, A);
    const B = this.db.prepare("UPDATE msgs SET msg = ?, seq = ? WHERE long_id = ?");
    try {
      B.run(JSON.stringify(A), A.msgSeq, A.msgId);
    } catch (g) {
      BA("updateMsg db error", g);
    }
  }
  async addFileCache(A) {
    const i = this.db.prepare("INSERT INTO files (name, path, url, size, uuid, elementType ,element, elementId, msgId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    return new Promise((B, g) => {
      i.run(
        A.name,
        A.path,
        A.url,
        A.size,
        A.uuid,
        A.elementType,
        JSON.stringify(A.element),
        A.elementId,
        A.msgId,
        function(n) {
          n && (BA("db could not add file", n), g(n)), B(null);
        }
      );
    });
  }
  async getFileCache(A, i) {
    const B = this.db.prepare(A);
    return new Promise((g, n) => {
      B.get(...i, (I, r) => {
        I && (BA("db could not get file cache", I), n(I)), r && (r.element = JSON.parse(r.element)), g(r);
      });
    });
  }
  async getFileCacheByName(A) {
    return this.getFileCache("SELECT * FROM files WHERE name = ?", [A]);
  }
  async getFileCacheByUuid(A) {
    return this.getFileCache("SELECT * FROM files WHERE uuid = ?", [A]);
  }
  // todo: 是否所有的文件都有uuid？语音消息有没有uuid？
  async updateFileCache(A) {
    const i = this.db.prepare("UPDATE files SET path = ?, url = ? WHERE uuid = ?");
    return new Promise((B, g) => {
      i.run(A.path, A.url, A.uuid, function(n) {
        n && (BA("db could not update file cache", n), g(n)), B(null);
      });
    });
  }
  // 被动收到的临时会话消息uin->uid
  async getReceivedTempUinMap() {
    const A = "SELECT * FROM temp_uins";
    return new Promise((i, B) => {
      this.db.all(A, (g, n) => {
        g && (BA("db could not get temp uin map", g), B(g));
        const I = {};
        n.forEach((r) => {
          I[r.uin] = r.uid;
        }), i(I);
      });
    });
  }
  // 通过uin获取临时会话消息uid
  async getUidByTempUin(A) {
    const i = "SELECT * FROM temp_uins WHERE uin = ?";
    return new Promise((B, g) => {
      this.db.get(i, [A], (n, I) => {
        n && (BA("db could not get temp uin map", n), g(n)), B(I == null ? void 0 : I.uid);
      });
    });
  }
  async addTempUin(A, i) {
    if (!await this.getUidByTempUin(A)) {
      const g = this.db.prepare("INSERT INTO temp_uins (uin, uid) VALUES (?, ?)");
      return new Promise((n, I) => {
        g.run(A, i, function(r) {
          r && (BA("db could not add temp uin", r), I(r)), n(null);
        });
      });
    }
  }
}
const ii = new fs();
var gI = {}, En = { exports: {} }, aQ = Ut.EventEmitter, Bg, _I;
function us() {
  if (_I)
    return Bg;
  _I = 1;
  function e(l, u) {
    var C = Object.keys(l);
    if (Object.getOwnPropertySymbols) {
      var s = Object.getOwnPropertySymbols(l);
      u && (s = s.filter(function(f) {
        return Object.getOwnPropertyDescriptor(l, f).enumerable;
      })), C.push.apply(C, s);
    }
    return C;
  }
  function t(l) {
    for (var u = 1; u < arguments.length; u++) {
      var C = arguments[u] != null ? arguments[u] : {};
      u % 2 ? e(Object(C), !0).forEach(function(s) {
        A(l, s, C[s]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(l, Object.getOwnPropertyDescriptors(C)) : e(Object(C)).forEach(function(s) {
        Object.defineProperty(l, s, Object.getOwnPropertyDescriptor(C, s));
      });
    }
    return l;
  }
  function A(l, u, C) {
    return u = n(u), u in l ? Object.defineProperty(l, u, { value: C, enumerable: !0, configurable: !0, writable: !0 }) : l[u] = C, l;
  }
  function i(l, u) {
    if (!(l instanceof u))
      throw new TypeError("Cannot call a class as a function");
  }
  function B(l, u) {
    for (var C = 0; C < u.length; C++) {
      var s = u[C];
      s.enumerable = s.enumerable || !1, s.configurable = !0, "value" in s && (s.writable = !0), Object.defineProperty(l, n(s.key), s);
    }
  }
  function g(l, u, C) {
    return u && B(l.prototype, u), C && B(l, C), Object.defineProperty(l, "prototype", { writable: !1 }), l;
  }
  function n(l) {
    var u = I(l, "string");
    return typeof u == "symbol" ? u : String(u);
  }
  function I(l, u) {
    if (typeof l != "object" || l === null)
      return l;
    var C = l[Symbol.toPrimitive];
    if (C !== void 0) {
      var s = C.call(l, u || "default");
      if (typeof s != "object")
        return s;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (u === "string" ? String : Number)(l);
  }
  var r = BB, a = r.Buffer, Q = Bt, E = Q.inspect, o = E && E.custom || "inspect";
  function c(l, u, C) {
    a.prototype.copy.call(l, u, C);
  }
  return Bg = /* @__PURE__ */ function() {
    function l() {
      i(this, l), this.head = null, this.tail = null, this.length = 0;
    }
    return g(l, [{
      key: "push",
      value: function(C) {
        var s = {
          data: C,
          next: null
        };
        this.length > 0 ? this.tail.next = s : this.head = s, this.tail = s, ++this.length;
      }
    }, {
      key: "unshift",
      value: function(C) {
        var s = {
          data: C,
          next: this.head
        };
        this.length === 0 && (this.tail = s), this.head = s, ++this.length;
      }
    }, {
      key: "shift",
      value: function() {
        if (this.length !== 0) {
          var C = this.head.data;
          return this.length === 1 ? this.head = this.tail = null : this.head = this.head.next, --this.length, C;
        }
      }
    }, {
      key: "clear",
      value: function() {
        this.head = this.tail = null, this.length = 0;
      }
    }, {
      key: "join",
      value: function(C) {
        if (this.length === 0)
          return "";
        for (var s = this.head, f = "" + s.data; s = s.next; )
          f += C + s.data;
        return f;
      }
    }, {
      key: "concat",
      value: function(C) {
        if (this.length === 0)
          return a.alloc(0);
        for (var s = a.allocUnsafe(C >>> 0), f = this.head, h = 0; f; )
          c(f.data, s, h), h += f.data.length, f = f.next;
        return s;
      }
      // Consumes a specified amount of bytes or characters from the buffered data.
    }, {
      key: "consume",
      value: function(C, s) {
        var f;
        return C < this.head.data.length ? (f = this.head.data.slice(0, C), this.head.data = this.head.data.slice(C)) : C === this.head.data.length ? f = this.shift() : f = s ? this._getString(C) : this._getBuffer(C), f;
      }
    }, {
      key: "first",
      value: function() {
        return this.head.data;
      }
      // Consumes a specified amount of characters from the buffered data.
    }, {
      key: "_getString",
      value: function(C) {
        var s = this.head, f = 1, h = s.data;
        for (C -= h.length; s = s.next; ) {
          var x = s.data, d = C > x.length ? x.length : C;
          if (d === x.length ? h += x : h += x.slice(0, C), C -= d, C === 0) {
            d === x.length ? (++f, s.next ? this.head = s.next : this.head = this.tail = null) : (this.head = s, s.data = x.slice(d));
            break;
          }
          ++f;
        }
        return this.length -= f, h;
      }
      // Consumes a specified amount of bytes from the buffered data.
    }, {
      key: "_getBuffer",
      value: function(C) {
        var s = a.allocUnsafe(C), f = this.head, h = 1;
        for (f.data.copy(s), C -= f.data.length; f = f.next; ) {
          var x = f.data, d = C > x.length ? x.length : C;
          if (x.copy(s, s.length - C, 0, d), C -= d, C === 0) {
            d === x.length ? (++h, f.next ? this.head = f.next : this.head = this.tail = null) : (this.head = f, f.data = x.slice(d));
            break;
          }
          ++h;
        }
        return this.length -= h, s;
      }
      // Make sure the linked list only shows the minimal necessary information.
    }, {
      key: o,
      value: function(C, s) {
        return E(this, t(t({}, s), {}, {
          // Only inspect one level.
          depth: 0,
          // It should not recurse.
          customInspect: !1
        }));
      }
    }]), l;
  }(), Bg;
}
function xs(e, t) {
  var A = this, i = this._readableState && this._readableState.destroyed, B = this._writableState && this._writableState.destroyed;
  return i || B ? (t ? t(e) : e && (this._writableState ? this._writableState.errorEmitted || (this._writableState.errorEmitted = !0, process.nextTick(Qn, this, e)) : process.nextTick(Qn, this, e)), this) : (this._readableState && (this._readableState.destroyed = !0), this._writableState && (this._writableState.destroyed = !0), this._destroy(e || null, function(g) {
    !t && g ? A._writableState ? A._writableState.errorEmitted ? process.nextTick(Bi, A) : (A._writableState.errorEmitted = !0, process.nextTick(jI, A, g)) : process.nextTick(jI, A, g) : t ? (process.nextTick(Bi, A), t(g)) : process.nextTick(Bi, A);
  }), this);
}
function jI(e, t) {
  Qn(e, t), Bi(e);
}
function Bi(e) {
  e._writableState && !e._writableState.emitClose || e._readableState && !e._readableState.emitClose || e.emit("close");
}
function hs() {
  this._readableState && (this._readableState.destroyed = !1, this._readableState.reading = !1, this._readableState.ended = !1, this._readableState.endEmitted = !1), this._writableState && (this._writableState.destroyed = !1, this._writableState.ended = !1, this._writableState.ending = !1, this._writableState.finalCalled = !1, this._writableState.prefinished = !1, this._writableState.finished = !1, this._writableState.errorEmitted = !1);
}
function Qn(e, t) {
  e.emit("error", t);
}
function ds(e, t) {
  var A = e._readableState, i = e._writableState;
  A && A.autoDestroy || i && i.autoDestroy ? e.destroy(t) : e.emit("error", t);
}
var sQ = {
  destroy: xs,
  undestroy: hs,
  errorOrDestroy: ds
}, gt = {};
function ls(e, t) {
  e.prototype = Object.create(t.prototype), e.prototype.constructor = e, e.__proto__ = t;
}
var CQ = {};
function OA(e, t, A) {
  A || (A = Error);
  function i(g, n, I) {
    return typeof t == "string" ? t : t(g, n, I);
  }
  var B = /* @__PURE__ */ function(g) {
    ls(n, g);
    function n(I, r, a) {
      return g.call(this, i(I, r, a)) || this;
    }
    return n;
  }(A);
  B.prototype.name = A.name, B.prototype.code = e, CQ[e] = B;
}
function $I(e, t) {
  if (Array.isArray(e)) {
    var A = e.length;
    return e = e.map(function(i) {
      return String(i);
    }), A > 2 ? "one of ".concat(t, " ").concat(e.slice(0, A - 1).join(", "), ", or ") + e[A - 1] : A === 2 ? "one of ".concat(t, " ").concat(e[0], " or ").concat(e[1]) : "of ".concat(t, " ").concat(e[0]);
  } else
    return "of ".concat(t, " ").concat(String(e));
}
function ws(e, t, A) {
  return e.substr(!A || A < 0 ? 0 : +A, t.length) === t;
}
function ys(e, t, A) {
  return (A === void 0 || A > e.length) && (A = e.length), e.substring(A - t.length, A) === t;
}
function Ds(e, t, A) {
  return typeof A != "number" && (A = 0), A + t.length > e.length ? !1 : e.indexOf(t, A) !== -1;
}
OA("ERR_INVALID_OPT_VALUE", function(e, t) {
  return 'The value "' + t + '" is invalid for option "' + e + '"';
}, TypeError);
OA("ERR_INVALID_ARG_TYPE", function(e, t, A) {
  var i;
  typeof t == "string" && ws(t, "not ") ? (i = "must not be", t = t.replace(/^not /, "")) : i = "must be";
  var B;
  if (ys(e, " argument"))
    B = "The ".concat(e, " ").concat(i, " ").concat($I(t, "type"));
  else {
    var g = Ds(e, ".") ? "property" : "argument";
    B = 'The "'.concat(e, '" ').concat(g, " ").concat(i, " ").concat($I(t, "type"));
  }
  return B += ". Received type ".concat(typeof A), B;
}, TypeError);
OA("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF");
OA("ERR_METHOD_NOT_IMPLEMENTED", function(e) {
  return "The " + e + " method is not implemented";
});
OA("ERR_STREAM_PREMATURE_CLOSE", "Premature close");
OA("ERR_STREAM_DESTROYED", function(e) {
  return "Cannot call " + e + " after a stream was destroyed";
});
OA("ERR_MULTIPLE_CALLBACK", "Callback called multiple times");
OA("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable");
OA("ERR_STREAM_WRITE_AFTER_END", "write after end");
OA("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError);
OA("ERR_UNKNOWN_ENCODING", function(e) {
  return "Unknown encoding: " + e;
}, TypeError);
OA("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event");
gt.codes = CQ;
var ps = gt.codes.ERR_INVALID_OPT_VALUE;
function ms(e, t, A) {
  return e.highWaterMark != null ? e.highWaterMark : t ? e[A] : null;
}
function Gs(e, t, A, i) {
  var B = ms(t, i, A);
  if (B != null) {
    if (!(isFinite(B) && Math.floor(B) === B) || B < 0) {
      var g = i ? A : "highWaterMark";
      throw new ps(g, B);
    }
    return Math.floor(B);
  }
  return e.objectMode ? 16 : 16 * 1024;
}
var cQ = {
  getHighWaterMark: Gs
}, on = { exports: {} };
typeof Object.create == "function" ? on.exports = function(t, A) {
  A && (t.super_ = A, t.prototype = Object.create(A.prototype, {
    constructor: {
      value: t,
      enumerable: !1,
      writable: !0,
      configurable: !0
    }
  }));
} : on.exports = function(t, A) {
  if (A) {
    t.super_ = A;
    var i = function() {
    };
    i.prototype = A.prototype, t.prototype = new i(), t.prototype.constructor = t;
  }
};
var ht = on.exports, Fs = Rs;
function Rs(e, t) {
  if (gg("noDeprecation"))
    return e;
  var A = !1;
  function i() {
    if (!A) {
      if (gg("throwDeprecation"))
        throw new Error(t);
      gg("traceDeprecation") ? console.trace(t) : console.warn(t), A = !0;
    }
    return e.apply(this, arguments);
  }
  return i;
}
function gg(e) {
  try {
    if (!it.localStorage)
      return !1;
  } catch {
    return !1;
  }
  var t = it.localStorage[e];
  return t == null ? !1 : String(t).toLowerCase() === "true";
}
var ng, Ar;
function fQ() {
  if (Ar)
    return ng;
  Ar = 1, ng = v;
  function e(R) {
    var F = this;
    this.next = null, this.entry = null, this.finish = function() {
      Oe(F, R);
    };
  }
  var t;
  v.WritableState = m;
  var A = {
    deprecate: Fs
  }, i = aQ, B = BB.Buffer, g = (typeof it < "u" ? it : typeof window < "u" ? window : typeof self < "u" ? self : {}).Uint8Array || function() {
  };
  function n(R) {
    return B.from(R);
  }
  function I(R) {
    return B.isBuffer(R) || R instanceof g;
  }
  var r = sQ, a = cQ, Q = a.getHighWaterMark, E = gt.codes, o = E.ERR_INVALID_ARG_TYPE, c = E.ERR_METHOD_NOT_IMPLEMENTED, l = E.ERR_MULTIPLE_CALLBACK, u = E.ERR_STREAM_CANNOT_PIPE, C = E.ERR_STREAM_DESTROYED, s = E.ERR_STREAM_NULL_VALUES, f = E.ERR_STREAM_WRITE_AFTER_END, h = E.ERR_UNKNOWN_ENCODING, x = r.errorOrDestroy;
  ht(v, i);
  function d() {
  }
  function m(R, F, Y) {
    t = t || ut(), R = R || {}, typeof Y != "boolean" && (Y = F instanceof t), this.objectMode = !!R.objectMode, Y && (this.objectMode = this.objectMode || !!R.writableObjectMode), this.highWaterMark = Q(this, R, "writableHighWaterMark", Y), this.finalCalled = !1, this.needDrain = !1, this.ending = !1, this.ended = !1, this.finished = !1, this.destroyed = !1;
    var P = R.decodeStrings === !1;
    this.decodeStrings = !P, this.defaultEncoding = R.defaultEncoding || "utf8", this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, this.onwrite = function(j) {
      cA(F, j);
    }, this.writecb = null, this.writelen = 0, this.bufferedRequest = null, this.lastBufferedRequest = null, this.pendingcb = 0, this.prefinished = !1, this.errorEmitted = !1, this.emitClose = R.emitClose !== !1, this.autoDestroy = !!R.autoDestroy, this.bufferedRequestCount = 0, this.corkedRequestsFree = new e(this);
  }
  m.prototype.getBuffer = function() {
    for (var F = this.bufferedRequest, Y = []; F; )
      Y.push(F), F = F.next;
    return Y;
  }, function() {
    try {
      Object.defineProperty(m.prototype, "buffer", {
        get: A.deprecate(function() {
          return this.getBuffer();
        }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
      });
    } catch {
    }
  }();
  var H;
  typeof Symbol == "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] == "function" ? (H = Function.prototype[Symbol.hasInstance], Object.defineProperty(v, Symbol.hasInstance, {
    value: function(F) {
      return H.call(this, F) ? !0 : this !== v ? !1 : F && F._writableState instanceof m;
    }
  })) : H = function(F) {
    return F instanceof this;
  };
  function v(R) {
    t = t || ut();
    var F = this instanceof t;
    if (!F && !H.call(v, this))
      return new v(R);
    this._writableState = new m(R, this, F), this.writable = !0, R && (typeof R.write == "function" && (this._write = R.write), typeof R.writev == "function" && (this._writev = R.writev), typeof R.destroy == "function" && (this._destroy = R.destroy), typeof R.final == "function" && (this._final = R.final)), i.call(this);
  }
  v.prototype.pipe = function() {
    x(this, new u());
  };
  function N(R, F) {
    var Y = new f();
    x(R, Y), process.nextTick(F, Y);
  }
  function M(R, F, Y, P) {
    var j;
    return Y === null ? j = new s() : typeof Y != "string" && !F.objectMode && (j = new o("chunk", ["string", "Buffer"], Y)), j ? (x(R, j), process.nextTick(P, j), !1) : !0;
  }
  v.prototype.write = function(R, F, Y) {
    var P = this._writableState, j = !1, D = !P.objectMode && I(R);
    return D && !B.isBuffer(R) && (R = n(R)), typeof F == "function" && (Y = F, F = null), D ? F = "buffer" : F || (F = P.defaultEncoding), typeof Y != "function" && (Y = d), P.ending ? N(this, Y) : (D || M(this, P, R, Y)) && (P.pendingcb++, j = V(this, P, D, R, F, Y)), j;
  }, v.prototype.cork = function() {
    this._writableState.corked++;
  }, v.prototype.uncork = function() {
    var R = this._writableState;
    R.corked && (R.corked--, !R.writing && !R.corked && !R.bufferProcessing && R.bufferedRequest && _A(this, R));
  }, v.prototype.setDefaultEncoding = function(F) {
    if (typeof F == "string" && (F = F.toLowerCase()), !(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((F + "").toLowerCase()) > -1))
      throw new h(F);
    return this._writableState.defaultEncoding = F, this;
  }, Object.defineProperty(v.prototype, "writableBuffer", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState && this._writableState.getBuffer();
    }
  });
  function Z(R, F, Y) {
    return !R.objectMode && R.decodeStrings !== !1 && typeof F == "string" && (F = B.from(F, Y)), F;
  }
  Object.defineProperty(v.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState.highWaterMark;
    }
  });
  function V(R, F, Y, P, j, D) {
    if (!Y) {
      var w = Z(F, P, j);
      P !== w && (Y = !0, j = "buffer", P = w);
    }
    var S = F.objectMode ? 1 : P.length;
    F.length += S;
    var U = F.length < F.highWaterMark;
    if (U || (F.needDrain = !0), F.writing || F.corked) {
      var X = F.lastBufferedRequest;
      F.lastBufferedRequest = {
        chunk: P,
        encoding: j,
        isBuf: Y,
        callback: D,
        next: null
      }, X ? X.next = F.lastBufferedRequest : F.bufferedRequest = F.lastBufferedRequest, F.bufferedRequestCount += 1;
    } else
      EA(R, F, !1, S, P, j, D);
    return U;
  }
  function EA(R, F, Y, P, j, D, w) {
    F.writelen = P, F.writecb = w, F.writing = !0, F.sync = !0, F.destroyed ? F.onwrite(new C("write")) : Y ? R._writev(j, F.onwrite) : R._write(j, D, F.onwrite), F.sync = !1;
  }
  function _(R, F, Y, P, j) {
    --F.pendingcb, Y ? (process.nextTick(j, P), process.nextTick(MA, R, F), R._writableState.errorEmitted = !0, x(R, P)) : (j(P), R._writableState.errorEmitted = !0, x(R, P), MA(R, F));
  }
  function gA(R) {
    R.writing = !1, R.writecb = null, R.length -= R.writelen, R.writelen = 0;
  }
  function cA(R, F) {
    var Y = R._writableState, P = Y.sync, j = Y.writecb;
    if (typeof j != "function")
      throw new l();
    if (gA(Y), F)
      _(R, Y, P, F, j);
    else {
      var D = pe(Y) || R.destroyed;
      !D && !Y.corked && !Y.bufferProcessing && Y.bufferedRequest && _A(R, Y), P ? process.nextTick(sA, R, Y, D, j) : sA(R, Y, D, j);
    }
  }
  function sA(R, F, Y, P) {
    Y || LA(R, F), F.pendingcb--, P(), MA(R, F);
  }
  function LA(R, F) {
    F.length === 0 && F.needDrain && (F.needDrain = !1, R.emit("drain"));
  }
  function _A(R, F) {
    F.bufferProcessing = !0;
    var Y = F.bufferedRequest;
    if (R._writev && Y && Y.next) {
      var P = F.bufferedRequestCount, j = new Array(P), D = F.corkedRequestsFree;
      D.entry = Y;
      for (var w = 0, S = !0; Y; )
        j[w] = Y, Y.isBuf || (S = !1), Y = Y.next, w += 1;
      j.allBuffers = S, EA(R, F, !0, F.length, j, "", D.finish), F.pendingcb++, F.lastBufferedRequest = null, D.next ? (F.corkedRequestsFree = D.next, D.next = null) : F.corkedRequestsFree = new e(F), F.bufferedRequestCount = 0;
    } else {
      for (; Y; ) {
        var U = Y.chunk, X = Y.encoding, k = Y.callback, iA = F.objectMode ? 1 : U.length;
        if (EA(R, F, !1, iA, U, X, k), Y = Y.next, F.bufferedRequestCount--, F.writing)
          break;
      }
      Y === null && (F.lastBufferedRequest = null);
    }
    F.bufferedRequest = Y, F.bufferProcessing = !1;
  }
  v.prototype._write = function(R, F, Y) {
    Y(new c("_write()"));
  }, v.prototype._writev = null, v.prototype.end = function(R, F, Y) {
    var P = this._writableState;
    return typeof R == "function" ? (Y = R, R = null, F = null) : typeof F == "function" && (Y = F, F = null), R != null && this.write(R, F), P.corked && (P.corked = 1, this.uncork()), P.ending || ve(this, P, Y), this;
  }, Object.defineProperty(v.prototype, "writableLength", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState.length;
    }
  });
  function pe(R) {
    return R.ending && R.length === 0 && R.bufferedRequest === null && !R.finished && !R.writing;
  }
  function ce(R, F) {
    R._final(function(Y) {
      F.pendingcb--, Y && x(R, Y), F.prefinished = !0, R.emit("prefinish"), MA(R, F);
    });
  }
  function yA(R, F) {
    !F.prefinished && !F.finalCalled && (typeof R._final == "function" && !F.destroyed ? (F.pendingcb++, F.finalCalled = !0, process.nextTick(ce, R, F)) : (F.prefinished = !0, R.emit("prefinish")));
  }
  function MA(R, F) {
    var Y = pe(F);
    if (Y && (yA(R, F), F.pendingcb === 0 && (F.finished = !0, R.emit("finish"), F.autoDestroy))) {
      var P = R._readableState;
      (!P || P.autoDestroy && P.endEmitted) && R.destroy();
    }
    return Y;
  }
  function ve(R, F, Y) {
    F.ending = !0, MA(R, F), Y && (F.finished ? process.nextTick(Y) : R.once("finish", Y)), F.ended = !0, R.writable = !1;
  }
  function Oe(R, F, Y) {
    var P = R.entry;
    for (R.entry = null; P; ) {
      var j = P.callback;
      F.pendingcb--, j(Y), P = P.next;
    }
    F.corkedRequestsFree.next = R;
  }
  return Object.defineProperty(v.prototype, "destroyed", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState === void 0 ? !1 : this._writableState.destroyed;
    },
    set: function(F) {
      this._writableState && (this._writableState.destroyed = F);
    }
  }), v.prototype.destroy = r.destroy, v.prototype._undestroy = r.undestroy, v.prototype._destroy = function(R, F) {
    F(R);
  }, ng;
}
var Ig, er;
function ut() {
  if (er)
    return Ig;
  er = 1;
  var e = Object.keys || function(a) {
    var Q = [];
    for (var E in a)
      Q.push(E);
    return Q;
  };
  Ig = n;
  var t = xQ(), A = fQ();
  ht(n, t);
  for (var i = e(A.prototype), B = 0; B < i.length; B++) {
    var g = i[B];
    n.prototype[g] || (n.prototype[g] = A.prototype[g]);
  }
  function n(a) {
    if (!(this instanceof n))
      return new n(a);
    t.call(this, a), A.call(this, a), this.allowHalfOpen = !0, a && (a.readable === !1 && (this.readable = !1), a.writable === !1 && (this.writable = !1), a.allowHalfOpen === !1 && (this.allowHalfOpen = !1, this.once("end", I)));
  }
  Object.defineProperty(n.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState.highWaterMark;
    }
  }), Object.defineProperty(n.prototype, "writableBuffer", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState && this._writableState.getBuffer();
    }
  }), Object.defineProperty(n.prototype, "writableLength", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState.length;
    }
  });
  function I() {
    this._writableState.ended || process.nextTick(r, this);
  }
  function r(a) {
    a.end();
  }
  return Object.defineProperty(n.prototype, "destroyed", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState === void 0 || this._writableState === void 0 ? !1 : this._readableState.destroyed && this._writableState.destroyed;
    },
    set: function(Q) {
      this._readableState === void 0 || this._writableState === void 0 || (this._readableState.destroyed = Q, this._writableState.destroyed = Q);
    }
  }), Ig;
}
var rg = {}, Pt = { exports: {} };
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
var tr;
function Ss() {
  return tr || (tr = 1, function(e, t) {
    var A = BB, i = A.Buffer;
    function B(n, I) {
      for (var r in n)
        I[r] = n[r];
    }
    i.from && i.alloc && i.allocUnsafe && i.allocUnsafeSlow ? e.exports = A : (B(A, t), t.Buffer = g);
    function g(n, I, r) {
      return i(n, I, r);
    }
    g.prototype = Object.create(i.prototype), B(i, g), g.from = function(n, I, r) {
      if (typeof n == "number")
        throw new TypeError("Argument must not be a number");
      return i(n, I, r);
    }, g.alloc = function(n, I, r) {
      if (typeof n != "number")
        throw new TypeError("Argument must be a number");
      var a = i(n);
      return I !== void 0 ? typeof r == "string" ? a.fill(I, r) : a.fill(I) : a.fill(0), a;
    }, g.allocUnsafe = function(n) {
      if (typeof n != "number")
        throw new TypeError("Argument must be a number");
      return i(n);
    }, g.allocUnsafeSlow = function(n) {
      if (typeof n != "number")
        throw new TypeError("Argument must be a number");
      return A.SlowBuffer(n);
    };
  }(Pt, Pt.exports)), Pt.exports;
}
var ir;
function Br() {
  if (ir)
    return rg;
  ir = 1;
  var e = Ss().Buffer, t = e.isEncoding || function(s) {
    switch (s = "" + s, s && s.toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
      case "raw":
        return !0;
      default:
        return !1;
    }
  };
  function A(s) {
    if (!s)
      return "utf8";
    for (var f; ; )
      switch (s) {
        case "utf8":
        case "utf-8":
          return "utf8";
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return "utf16le";
        case "latin1":
        case "binary":
          return "latin1";
        case "base64":
        case "ascii":
        case "hex":
          return s;
        default:
          if (f)
            return;
          s = ("" + s).toLowerCase(), f = !0;
      }
  }
  function i(s) {
    var f = A(s);
    if (typeof f != "string" && (e.isEncoding === t || !t(s)))
      throw new Error("Unknown encoding: " + s);
    return f || s;
  }
  rg.StringDecoder = B;
  function B(s) {
    this.encoding = i(s);
    var f;
    switch (this.encoding) {
      case "utf16le":
        this.text = E, this.end = o, f = 4;
        break;
      case "utf8":
        this.fillLast = r, f = 4;
        break;
      case "base64":
        this.text = c, this.end = l, f = 3;
        break;
      default:
        this.write = u, this.end = C;
        return;
    }
    this.lastNeed = 0, this.lastTotal = 0, this.lastChar = e.allocUnsafe(f);
  }
  B.prototype.write = function(s) {
    if (s.length === 0)
      return "";
    var f, h;
    if (this.lastNeed) {
      if (f = this.fillLast(s), f === void 0)
        return "";
      h = this.lastNeed, this.lastNeed = 0;
    } else
      h = 0;
    return h < s.length ? f ? f + this.text(s, h) : this.text(s, h) : f || "";
  }, B.prototype.end = Q, B.prototype.text = a, B.prototype.fillLast = function(s) {
    if (this.lastNeed <= s.length)
      return s.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
    s.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, s.length), this.lastNeed -= s.length;
  };
  function g(s) {
    return s <= 127 ? 0 : s >> 5 === 6 ? 2 : s >> 4 === 14 ? 3 : s >> 3 === 30 ? 4 : s >> 6 === 2 ? -1 : -2;
  }
  function n(s, f, h) {
    var x = f.length - 1;
    if (x < h)
      return 0;
    var d = g(f[x]);
    return d >= 0 ? (d > 0 && (s.lastNeed = d - 1), d) : --x < h || d === -2 ? 0 : (d = g(f[x]), d >= 0 ? (d > 0 && (s.lastNeed = d - 2), d) : --x < h || d === -2 ? 0 : (d = g(f[x]), d >= 0 ? (d > 0 && (d === 2 ? d = 0 : s.lastNeed = d - 3), d) : 0));
  }
  function I(s, f, h) {
    if ((f[0] & 192) !== 128)
      return s.lastNeed = 0, "�";
    if (s.lastNeed > 1 && f.length > 1) {
      if ((f[1] & 192) !== 128)
        return s.lastNeed = 1, "�";
      if (s.lastNeed > 2 && f.length > 2 && (f[2] & 192) !== 128)
        return s.lastNeed = 2, "�";
    }
  }
  function r(s) {
    var f = this.lastTotal - this.lastNeed, h = I(this, s);
    if (h !== void 0)
      return h;
    if (this.lastNeed <= s.length)
      return s.copy(this.lastChar, f, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
    s.copy(this.lastChar, f, 0, s.length), this.lastNeed -= s.length;
  }
  function a(s, f) {
    var h = n(this, s, f);
    if (!this.lastNeed)
      return s.toString("utf8", f);
    this.lastTotal = h;
    var x = s.length - (h - this.lastNeed);
    return s.copy(this.lastChar, 0, x), s.toString("utf8", f, x);
  }
  function Q(s) {
    var f = s && s.length ? this.write(s) : "";
    return this.lastNeed ? f + "�" : f;
  }
  function E(s, f) {
    if ((s.length - f) % 2 === 0) {
      var h = s.toString("utf16le", f);
      if (h) {
        var x = h.charCodeAt(h.length - 1);
        if (x >= 55296 && x <= 56319)
          return this.lastNeed = 2, this.lastTotal = 4, this.lastChar[0] = s[s.length - 2], this.lastChar[1] = s[s.length - 1], h.slice(0, -1);
      }
      return h;
    }
    return this.lastNeed = 1, this.lastTotal = 2, this.lastChar[0] = s[s.length - 1], s.toString("utf16le", f, s.length - 1);
  }
  function o(s) {
    var f = s && s.length ? this.write(s) : "";
    if (this.lastNeed) {
      var h = this.lastTotal - this.lastNeed;
      return f + this.lastChar.toString("utf16le", 0, h);
    }
    return f;
  }
  function c(s, f) {
    var h = (s.length - f) % 3;
    return h === 0 ? s.toString("base64", f) : (this.lastNeed = 3 - h, this.lastTotal = 3, h === 1 ? this.lastChar[0] = s[s.length - 1] : (this.lastChar[0] = s[s.length - 2], this.lastChar[1] = s[s.length - 1]), s.toString("base64", f, s.length - h));
  }
  function l(s) {
    var f = s && s.length ? this.write(s) : "";
    return this.lastNeed ? f + this.lastChar.toString("base64", 0, 3 - this.lastNeed) : f;
  }
  function u(s) {
    return s.toString(this.encoding);
  }
  function C(s) {
    return s && s.length ? this.write(s) : "";
  }
  return rg;
}
var gr = gt.codes.ERR_STREAM_PREMATURE_CLOSE;
function bs(e) {
  var t = !1;
  return function() {
    if (!t) {
      t = !0;
      for (var A = arguments.length, i = new Array(A), B = 0; B < A; B++)
        i[B] = arguments[B];
      e.apply(this, i);
    }
  };
}
function Ns() {
}
function Us(e) {
  return e.setHeader && typeof e.abort == "function";
}
function uQ(e, t, A) {
  if (typeof t == "function")
    return uQ(e, null, t);
  t || (t = {}), A = bs(A || Ns);
  var i = t.readable || t.readable !== !1 && e.readable, B = t.writable || t.writable !== !1 && e.writable, g = function() {
    e.writable || I();
  }, n = e._writableState && e._writableState.finished, I = function() {
    B = !1, n = !0, i || A.call(e);
  }, r = e._readableState && e._readableState.endEmitted, a = function() {
    i = !1, r = !0, B || A.call(e);
  }, Q = function(l) {
    A.call(e, l);
  }, E = function() {
    var l;
    if (i && !r)
      return (!e._readableState || !e._readableState.ended) && (l = new gr()), A.call(e, l);
    if (B && !n)
      return (!e._writableState || !e._writableState.ended) && (l = new gr()), A.call(e, l);
  }, o = function() {
    e.req.on("finish", I);
  };
  return Us(e) ? (e.on("complete", I), e.on("abort", E), e.req ? o() : e.on("request", o)) : B && !e._writableState && (e.on("end", g), e.on("close", g)), e.on("end", a), e.on("finish", I), t.error !== !1 && e.on("error", Q), e.on("close", E), function() {
    e.removeListener("complete", I), e.removeListener("abort", E), e.removeListener("request", o), e.req && e.req.removeListener("finish", I), e.removeListener("end", g), e.removeListener("close", g), e.removeListener("finish", I), e.removeListener("end", a), e.removeListener("error", Q), e.removeListener("close", E);
  };
}
var nI = uQ, Eg, nr;
function vs() {
  if (nr)
    return Eg;
  nr = 1;
  var e;
  function t(h, x, d) {
    return x = A(x), x in h ? Object.defineProperty(h, x, { value: d, enumerable: !0, configurable: !0, writable: !0 }) : h[x] = d, h;
  }
  function A(h) {
    var x = i(h, "string");
    return typeof x == "symbol" ? x : String(x);
  }
  function i(h, x) {
    if (typeof h != "object" || h === null)
      return h;
    var d = h[Symbol.toPrimitive];
    if (d !== void 0) {
      var m = d.call(h, x || "default");
      if (typeof m != "object")
        return m;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (x === "string" ? String : Number)(h);
  }
  var B = nI, g = Symbol("lastResolve"), n = Symbol("lastReject"), I = Symbol("error"), r = Symbol("ended"), a = Symbol("lastPromise"), Q = Symbol("handlePromise"), E = Symbol("stream");
  function o(h, x) {
    return {
      value: h,
      done: x
    };
  }
  function c(h) {
    var x = h[g];
    if (x !== null) {
      var d = h[E].read();
      d !== null && (h[a] = null, h[g] = null, h[n] = null, x(o(d, !1)));
    }
  }
  function l(h) {
    process.nextTick(c, h);
  }
  function u(h, x) {
    return function(d, m) {
      h.then(function() {
        if (x[r]) {
          d(o(void 0, !0));
          return;
        }
        x[Q](d, m);
      }, m);
    };
  }
  var C = Object.getPrototypeOf(function() {
  }), s = Object.setPrototypeOf((e = {
    get stream() {
      return this[E];
    },
    next: function() {
      var x = this, d = this[I];
      if (d !== null)
        return Promise.reject(d);
      if (this[r])
        return Promise.resolve(o(void 0, !0));
      if (this[E].destroyed)
        return new Promise(function(N, M) {
          process.nextTick(function() {
            x[I] ? M(x[I]) : N(o(void 0, !0));
          });
        });
      var m = this[a], H;
      if (m)
        H = new Promise(u(m, this));
      else {
        var v = this[E].read();
        if (v !== null)
          return Promise.resolve(o(v, !1));
        H = new Promise(this[Q]);
      }
      return this[a] = H, H;
    }
  }, t(e, Symbol.asyncIterator, function() {
    return this;
  }), t(e, "return", function() {
    var x = this;
    return new Promise(function(d, m) {
      x[E].destroy(null, function(H) {
        if (H) {
          m(H);
          return;
        }
        d(o(void 0, !0));
      });
    });
  }), e), C), f = function(x) {
    var d, m = Object.create(s, (d = {}, t(d, E, {
      value: x,
      writable: !0
    }), t(d, g, {
      value: null,
      writable: !0
    }), t(d, n, {
      value: null,
      writable: !0
    }), t(d, I, {
      value: null,
      writable: !0
    }), t(d, r, {
      value: x._readableState.endEmitted,
      writable: !0
    }), t(d, Q, {
      value: function(v, N) {
        var M = m[E].read();
        M ? (m[a] = null, m[g] = null, m[n] = null, v(o(M, !1))) : (m[g] = v, m[n] = N);
      },
      writable: !0
    }), d));
    return m[a] = null, B(x, function(H) {
      if (H && H.code !== "ERR_STREAM_PREMATURE_CLOSE") {
        var v = m[n];
        v !== null && (m[a] = null, m[g] = null, m[n] = null, v(H)), m[I] = H;
        return;
      }
      var N = m[g];
      N !== null && (m[a] = null, m[g] = null, m[n] = null, N(o(void 0, !0))), m[r] = !0;
    }), x.on("readable", l.bind(null, m)), m;
  };
  return Eg = f, Eg;
}
var Qg, Ir;
function Hs() {
  return Ir || (Ir = 1, Qg = function() {
    throw new Error("Readable.from is not available in the browser");
  }), Qg;
}
var og, rr;
function xQ() {
  if (rr)
    return og;
  rr = 1, og = N;
  var e;
  N.ReadableState = v, Ut.EventEmitter;
  var t = function(w, S) {
    return w.listeners(S).length;
  }, A = aQ, i = BB.Buffer, B = (typeof it < "u" ? it : typeof window < "u" ? window : typeof self < "u" ? self : {}).Uint8Array || function() {
  };
  function g(D) {
    return i.from(D);
  }
  function n(D) {
    return i.isBuffer(D) || D instanceof B;
  }
  var I = Bt, r;
  I && I.debuglog ? r = I.debuglog("stream") : r = function() {
  };
  var a = us(), Q = sQ, E = cQ, o = E.getHighWaterMark, c = gt.codes, l = c.ERR_INVALID_ARG_TYPE, u = c.ERR_STREAM_PUSH_AFTER_EOF, C = c.ERR_METHOD_NOT_IMPLEMENTED, s = c.ERR_STREAM_UNSHIFT_AFTER_END_EVENT, f, h, x;
  ht(N, A);
  var d = Q.errorOrDestroy, m = ["error", "close", "destroy", "pause", "resume"];
  function H(D, w, S) {
    if (typeof D.prependListener == "function")
      return D.prependListener(w, S);
    !D._events || !D._events[w] ? D.on(w, S) : Array.isArray(D._events[w]) ? D._events[w].unshift(S) : D._events[w] = [S, D._events[w]];
  }
  function v(D, w, S) {
    e = e || ut(), D = D || {}, typeof S != "boolean" && (S = w instanceof e), this.objectMode = !!D.objectMode, S && (this.objectMode = this.objectMode || !!D.readableObjectMode), this.highWaterMark = o(this, D, "readableHighWaterMark", S), this.buffer = new a(), this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, this.ended = !1, this.endEmitted = !1, this.reading = !1, this.sync = !0, this.needReadable = !1, this.emittedReadable = !1, this.readableListening = !1, this.resumeScheduled = !1, this.paused = !0, this.emitClose = D.emitClose !== !1, this.autoDestroy = !!D.autoDestroy, this.destroyed = !1, this.defaultEncoding = D.defaultEncoding || "utf8", this.awaitDrain = 0, this.readingMore = !1, this.decoder = null, this.encoding = null, D.encoding && (f || (f = Br().StringDecoder), this.decoder = new f(D.encoding), this.encoding = D.encoding);
  }
  function N(D) {
    if (e = e || ut(), !(this instanceof N))
      return new N(D);
    var w = this instanceof e;
    this._readableState = new v(D, this, w), this.readable = !0, D && (typeof D.read == "function" && (this._read = D.read), typeof D.destroy == "function" && (this._destroy = D.destroy)), A.call(this);
  }
  Object.defineProperty(N.prototype, "destroyed", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState === void 0 ? !1 : this._readableState.destroyed;
    },
    set: function(w) {
      this._readableState && (this._readableState.destroyed = w);
    }
  }), N.prototype.destroy = Q.destroy, N.prototype._undestroy = Q.undestroy, N.prototype._destroy = function(D, w) {
    w(D);
  }, N.prototype.push = function(D, w) {
    var S = this._readableState, U;
    return S.objectMode ? U = !0 : typeof D == "string" && (w = w || S.defaultEncoding, w !== S.encoding && (D = i.from(D, w), w = ""), U = !0), M(this, D, w, !1, U);
  }, N.prototype.unshift = function(D) {
    return M(this, D, null, !0, !1);
  };
  function M(D, w, S, U, X) {
    r("readableAddChunk", w);
    var k = D._readableState;
    if (w === null)
      k.reading = !1, cA(D, k);
    else {
      var iA;
      if (X || (iA = V(k, w)), iA)
        d(D, iA);
      else if (k.objectMode || w && w.length > 0)
        if (typeof w != "string" && !k.objectMode && Object.getPrototypeOf(w) !== i.prototype && (w = g(w)), U)
          k.endEmitted ? d(D, new s()) : Z(D, k, w, !0);
        else if (k.ended)
          d(D, new u());
        else {
          if (k.destroyed)
            return !1;
          k.reading = !1, k.decoder && !S ? (w = k.decoder.write(w), k.objectMode || w.length !== 0 ? Z(D, k, w, !1) : _A(D, k)) : Z(D, k, w, !1);
        }
      else
        U || (k.reading = !1, _A(D, k));
    }
    return !k.ended && (k.length < k.highWaterMark || k.length === 0);
  }
  function Z(D, w, S, U) {
    w.flowing && w.length === 0 && !w.sync ? (w.awaitDrain = 0, D.emit("data", S)) : (w.length += w.objectMode ? 1 : S.length, U ? w.buffer.unshift(S) : w.buffer.push(S), w.needReadable && sA(D)), _A(D, w);
  }
  function V(D, w) {
    var S;
    return !n(w) && typeof w != "string" && w !== void 0 && !D.objectMode && (S = new l("chunk", ["string", "Buffer", "Uint8Array"], w)), S;
  }
  N.prototype.isPaused = function() {
    return this._readableState.flowing === !1;
  }, N.prototype.setEncoding = function(D) {
    f || (f = Br().StringDecoder);
    var w = new f(D);
    this._readableState.decoder = w, this._readableState.encoding = this._readableState.decoder.encoding;
    for (var S = this._readableState.buffer.head, U = ""; S !== null; )
      U += w.write(S.data), S = S.next;
    return this._readableState.buffer.clear(), U !== "" && this._readableState.buffer.push(U), this._readableState.length = U.length, this;
  };
  var EA = 1073741824;
  function _(D) {
    return D >= EA ? D = EA : (D--, D |= D >>> 1, D |= D >>> 2, D |= D >>> 4, D |= D >>> 8, D |= D >>> 16, D++), D;
  }
  function gA(D, w) {
    return D <= 0 || w.length === 0 && w.ended ? 0 : w.objectMode ? 1 : D !== D ? w.flowing && w.length ? w.buffer.head.data.length : w.length : (D > w.highWaterMark && (w.highWaterMark = _(D)), D <= w.length ? D : w.ended ? w.length : (w.needReadable = !0, 0));
  }
  N.prototype.read = function(D) {
    r("read", D), D = parseInt(D, 10);
    var w = this._readableState, S = D;
    if (D !== 0 && (w.emittedReadable = !1), D === 0 && w.needReadable && ((w.highWaterMark !== 0 ? w.length >= w.highWaterMark : w.length > 0) || w.ended))
      return r("read: emitReadable", w.length, w.ended), w.length === 0 && w.ended ? Y(this) : sA(this), null;
    if (D = gA(D, w), D === 0 && w.ended)
      return w.length === 0 && Y(this), null;
    var U = w.needReadable;
    r("need readable", U), (w.length === 0 || w.length - D < w.highWaterMark) && (U = !0, r("length less than watermark", U)), w.ended || w.reading ? (U = !1, r("reading or ended", U)) : U && (r("do read"), w.reading = !0, w.sync = !0, w.length === 0 && (w.needReadable = !0), this._read(w.highWaterMark), w.sync = !1, w.reading || (D = gA(S, w)));
    var X;
    return D > 0 ? X = F(D, w) : X = null, X === null ? (w.needReadable = w.length <= w.highWaterMark, D = 0) : (w.length -= D, w.awaitDrain = 0), w.length === 0 && (w.ended || (w.needReadable = !0), S !== D && w.ended && Y(this)), X !== null && this.emit("data", X), X;
  };
  function cA(D, w) {
    if (r("onEofChunk"), !w.ended) {
      if (w.decoder) {
        var S = w.decoder.end();
        S && S.length && (w.buffer.push(S), w.length += w.objectMode ? 1 : S.length);
      }
      w.ended = !0, w.sync ? sA(D) : (w.needReadable = !1, w.emittedReadable || (w.emittedReadable = !0, LA(D)));
    }
  }
  function sA(D) {
    var w = D._readableState;
    r("emitReadable", w.needReadable, w.emittedReadable), w.needReadable = !1, w.emittedReadable || (r("emitReadable", w.flowing), w.emittedReadable = !0, process.nextTick(LA, D));
  }
  function LA(D) {
    var w = D._readableState;
    r("emitReadable_", w.destroyed, w.length, w.ended), !w.destroyed && (w.length || w.ended) && (D.emit("readable"), w.emittedReadable = !1), w.needReadable = !w.flowing && !w.ended && w.length <= w.highWaterMark, R(D);
  }
  function _A(D, w) {
    w.readingMore || (w.readingMore = !0, process.nextTick(pe, D, w));
  }
  function pe(D, w) {
    for (; !w.reading && !w.ended && (w.length < w.highWaterMark || w.flowing && w.length === 0); ) {
      var S = w.length;
      if (r("maybeReadMore read 0"), D.read(0), S === w.length)
        break;
    }
    w.readingMore = !1;
  }
  N.prototype._read = function(D) {
    d(this, new C("_read()"));
  }, N.prototype.pipe = function(D, w) {
    var S = this, U = this._readableState;
    switch (U.pipesCount) {
      case 0:
        U.pipes = D;
        break;
      case 1:
        U.pipes = [U.pipes, D];
        break;
      default:
        U.pipes.push(D);
        break;
    }
    U.pipesCount += 1, r("pipe count=%d opts=%j", U.pipesCount, w);
    var X = (!w || w.end !== !1) && D !== process.stdout && D !== process.stderr, k = X ? kA : me;
    U.endEmitted ? process.nextTick(k) : S.once("end", k), D.on("unpipe", iA);
    function iA(fe, Ye) {
      r("onunpipe"), fe === S && Ye && Ye.hasUnpiped === !1 && (Ye.hasUnpiped = !0, mA());
    }
    function kA() {
      r("onend"), D.end();
    }
    var He = ce(S);
    D.on("drain", He);
    var _e = !1;
    function mA() {
      r("cleanup"), D.removeListener("close", je), D.removeListener("finish", $e), D.removeListener("drain", He), D.removeListener("error", GA), D.removeListener("unpipe", iA), S.removeListener("end", kA), S.removeListener("end", me), S.removeListener("data", nt), _e = !0, U.awaitDrain && (!D._writableState || D._writableState.needDrain) && He();
    }
    S.on("data", nt);
    function nt(fe) {
      r("ondata");
      var Ye = D.write(fe);
      r("dest.write", Ye), Ye === !1 && ((U.pipesCount === 1 && U.pipes === D || U.pipesCount > 1 && j(U.pipes, D) !== -1) && !_e && (r("false write response, pause", U.awaitDrain), U.awaitDrain++), S.pause());
    }
    function GA(fe) {
      r("onerror", fe), me(), D.removeListener("error", GA), t(D, "error") === 0 && d(D, fe);
    }
    H(D, "error", GA);
    function je() {
      D.removeListener("finish", $e), me();
    }
    D.once("close", je);
    function $e() {
      r("onfinish"), D.removeListener("close", je), me();
    }
    D.once("finish", $e);
    function me() {
      r("unpipe"), S.unpipe(D);
    }
    return D.emit("pipe", S), U.flowing || (r("pipe resume"), S.resume()), D;
  };
  function ce(D) {
    return function() {
      var S = D._readableState;
      r("pipeOnDrain", S.awaitDrain), S.awaitDrain && S.awaitDrain--, S.awaitDrain === 0 && t(D, "data") && (S.flowing = !0, R(D));
    };
  }
  N.prototype.unpipe = function(D) {
    var w = this._readableState, S = {
      hasUnpiped: !1
    };
    if (w.pipesCount === 0)
      return this;
    if (w.pipesCount === 1)
      return D && D !== w.pipes ? this : (D || (D = w.pipes), w.pipes = null, w.pipesCount = 0, w.flowing = !1, D && D.emit("unpipe", this, S), this);
    if (!D) {
      var U = w.pipes, X = w.pipesCount;
      w.pipes = null, w.pipesCount = 0, w.flowing = !1;
      for (var k = 0; k < X; k++)
        U[k].emit("unpipe", this, {
          hasUnpiped: !1
        });
      return this;
    }
    var iA = j(w.pipes, D);
    return iA === -1 ? this : (w.pipes.splice(iA, 1), w.pipesCount -= 1, w.pipesCount === 1 && (w.pipes = w.pipes[0]), D.emit("unpipe", this, S), this);
  }, N.prototype.on = function(D, w) {
    var S = A.prototype.on.call(this, D, w), U = this._readableState;
    return D === "data" ? (U.readableListening = this.listenerCount("readable") > 0, U.flowing !== !1 && this.resume()) : D === "readable" && !U.endEmitted && !U.readableListening && (U.readableListening = U.needReadable = !0, U.flowing = !1, U.emittedReadable = !1, r("on readable", U.length, U.reading), U.length ? sA(this) : U.reading || process.nextTick(MA, this)), S;
  }, N.prototype.addListener = N.prototype.on, N.prototype.removeListener = function(D, w) {
    var S = A.prototype.removeListener.call(this, D, w);
    return D === "readable" && process.nextTick(yA, this), S;
  }, N.prototype.removeAllListeners = function(D) {
    var w = A.prototype.removeAllListeners.apply(this, arguments);
    return (D === "readable" || D === void 0) && process.nextTick(yA, this), w;
  };
  function yA(D) {
    var w = D._readableState;
    w.readableListening = D.listenerCount("readable") > 0, w.resumeScheduled && !w.paused ? w.flowing = !0 : D.listenerCount("data") > 0 && D.resume();
  }
  function MA(D) {
    r("readable nexttick read 0"), D.read(0);
  }
  N.prototype.resume = function() {
    var D = this._readableState;
    return D.flowing || (r("resume"), D.flowing = !D.readableListening, ve(this, D)), D.paused = !1, this;
  };
  function ve(D, w) {
    w.resumeScheduled || (w.resumeScheduled = !0, process.nextTick(Oe, D, w));
  }
  function Oe(D, w) {
    r("resume", w.reading), w.reading || D.read(0), w.resumeScheduled = !1, D.emit("resume"), R(D), w.flowing && !w.reading && D.read(0);
  }
  N.prototype.pause = function() {
    return r("call pause flowing=%j", this._readableState.flowing), this._readableState.flowing !== !1 && (r("pause"), this._readableState.flowing = !1, this.emit("pause")), this._readableState.paused = !0, this;
  };
  function R(D) {
    var w = D._readableState;
    for (r("flow", w.flowing); w.flowing && D.read() !== null; )
      ;
  }
  N.prototype.wrap = function(D) {
    var w = this, S = this._readableState, U = !1;
    D.on("end", function() {
      if (r("wrapped end"), S.decoder && !S.ended) {
        var iA = S.decoder.end();
        iA && iA.length && w.push(iA);
      }
      w.push(null);
    }), D.on("data", function(iA) {
      if (r("wrapped data"), S.decoder && (iA = S.decoder.write(iA)), !(S.objectMode && iA == null) && !(!S.objectMode && (!iA || !iA.length))) {
        var kA = w.push(iA);
        kA || (U = !0, D.pause());
      }
    });
    for (var X in D)
      this[X] === void 0 && typeof D[X] == "function" && (this[X] = /* @__PURE__ */ function(kA) {
        return function() {
          return D[kA].apply(D, arguments);
        };
      }(X));
    for (var k = 0; k < m.length; k++)
      D.on(m[k], this.emit.bind(this, m[k]));
    return this._read = function(iA) {
      r("wrapped _read", iA), U && (U = !1, D.resume());
    }, this;
  }, typeof Symbol == "function" && (N.prototype[Symbol.asyncIterator] = function() {
    return h === void 0 && (h = vs()), h(this);
  }), Object.defineProperty(N.prototype, "readableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState.highWaterMark;
    }
  }), Object.defineProperty(N.prototype, "readableBuffer", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState && this._readableState.buffer;
    }
  }), Object.defineProperty(N.prototype, "readableFlowing", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState.flowing;
    },
    set: function(w) {
      this._readableState && (this._readableState.flowing = w);
    }
  }), N._fromList = F, Object.defineProperty(N.prototype, "readableLength", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState.length;
    }
  });
  function F(D, w) {
    if (w.length === 0)
      return null;
    var S;
    return w.objectMode ? S = w.buffer.shift() : !D || D >= w.length ? (w.decoder ? S = w.buffer.join("") : w.buffer.length === 1 ? S = w.buffer.first() : S = w.buffer.concat(w.length), w.buffer.clear()) : S = w.buffer.consume(D, w.decoder), S;
  }
  function Y(D) {
    var w = D._readableState;
    r("endReadable", w.endEmitted), w.endEmitted || (w.ended = !0, process.nextTick(P, w, D));
  }
  function P(D, w) {
    if (r("endReadableNT", D.endEmitted, D.length), !D.endEmitted && D.length === 0 && (D.endEmitted = !0, w.readable = !1, w.emit("end"), D.autoDestroy)) {
      var S = w._writableState;
      (!S || S.autoDestroy && S.finished) && w.destroy();
    }
  }
  typeof Symbol == "function" && (N.from = function(D, w) {
    return x === void 0 && (x = Hs()), x(N, D, w);
  });
  function j(D, w) {
    for (var S = 0, U = D.length; S < U; S++)
      if (D[S] === w)
        return S;
    return -1;
  }
  return og;
}
var hQ = be, sB = gt.codes, Ys = sB.ERR_METHOD_NOT_IMPLEMENTED, Ls = sB.ERR_MULTIPLE_CALLBACK, Ms = sB.ERR_TRANSFORM_ALREADY_TRANSFORMING, ks = sB.ERR_TRANSFORM_WITH_LENGTH_0, CB = ut();
ht(be, CB);
function Ks(e, t) {
  var A = this._transformState;
  A.transforming = !1;
  var i = A.writecb;
  if (i === null)
    return this.emit("error", new Ls());
  A.writechunk = null, A.writecb = null, t != null && this.push(t), i(e);
  var B = this._readableState;
  B.reading = !1, (B.needReadable || B.length < B.highWaterMark) && this._read(B.highWaterMark);
}
function be(e) {
  if (!(this instanceof be))
    return new be(e);
  CB.call(this, e), this._transformState = {
    afterTransform: Ks.bind(this),
    needTransform: !1,
    transforming: !1,
    writecb: null,
    writechunk: null,
    writeencoding: null
  }, this._readableState.needReadable = !0, this._readableState.sync = !1, e && (typeof e.transform == "function" && (this._transform = e.transform), typeof e.flush == "function" && (this._flush = e.flush)), this.on("prefinish", Js);
}
function Js() {
  var e = this;
  typeof this._flush == "function" && !this._readableState.destroyed ? this._flush(function(t, A) {
    Er(e, t, A);
  }) : Er(this, null, null);
}
be.prototype.push = function(e, t) {
  return this._transformState.needTransform = !1, CB.prototype.push.call(this, e, t);
};
be.prototype._transform = function(e, t, A) {
  A(new Ys("_transform()"));
};
be.prototype._write = function(e, t, A) {
  var i = this._transformState;
  if (i.writecb = A, i.writechunk = e, i.writeencoding = t, !i.transforming) {
    var B = this._readableState;
    (i.needTransform || B.needReadable || B.length < B.highWaterMark) && this._read(B.highWaterMark);
  }
};
be.prototype._read = function(e) {
  var t = this._transformState;
  t.writechunk !== null && !t.transforming ? (t.transforming = !0, this._transform(t.writechunk, t.writeencoding, t.afterTransform)) : t.needTransform = !0;
};
be.prototype._destroy = function(e, t) {
  CB.prototype._destroy.call(this, e, function(A) {
    t(A);
  });
};
function Er(e, t, A) {
  if (t)
    return e.emit("error", t);
  if (A != null && e.push(A), e._writableState.length)
    throw new ks();
  if (e._transformState.transforming)
    throw new Ms();
  return e.push(null);
}
var Ws = Nt, dQ = hQ;
ht(Nt, dQ);
function Nt(e) {
  if (!(this instanceof Nt))
    return new Nt(e);
  dQ.call(this, e);
}
Nt.prototype._transform = function(e, t, A) {
  A(null, e);
};
var ag;
function qs(e) {
  var t = !1;
  return function() {
    t || (t = !0, e.apply(void 0, arguments));
  };
}
var lQ = gt.codes, Zs = lQ.ERR_MISSING_ARGS, Vs = lQ.ERR_STREAM_DESTROYED;
function Qr(e) {
  if (e)
    throw e;
}
function Ts(e) {
  return e.setHeader && typeof e.abort == "function";
}
function Ps(e, t, A, i) {
  i = qs(i);
  var B = !1;
  e.on("close", function() {
    B = !0;
  }), ag === void 0 && (ag = nI), ag(e, {
    readable: t,
    writable: A
  }, function(n) {
    if (n)
      return i(n);
    B = !0, i();
  });
  var g = !1;
  return function(n) {
    if (!B && !g) {
      if (g = !0, Ts(e))
        return e.abort();
      if (typeof e.destroy == "function")
        return e.destroy();
      i(n || new Vs("pipe"));
    }
  };
}
function or(e) {
  e();
}
function Xs(e, t) {
  return e.pipe(t);
}
function zs(e) {
  return !e.length || typeof e[e.length - 1] != "function" ? Qr : e.pop();
}
function Os() {
  for (var e = arguments.length, t = new Array(e), A = 0; A < e; A++)
    t[A] = arguments[A];
  var i = zs(t);
  if (Array.isArray(t[0]) && (t = t[0]), t.length < 2)
    throw new Zs("streams");
  var B, g = t.map(function(n, I) {
    var r = I < t.length - 1, a = I > 0;
    return Ps(n, r, a, function(Q) {
      B || (B = Q), Q && g.forEach(or), !r && (g.forEach(or), i(B));
    });
  });
  return t.reduce(Xs);
}
var _s = Os;
(function(e, t) {
  t = e.exports = xQ(), t.Stream = t, t.Readable = t, t.Writable = fQ(), t.Duplex = ut(), t.Transform = hQ, t.PassThrough = Ws, t.finished = nI, t.pipeline = _s;
})(En, En.exports);
var js = En.exports;
Object.defineProperty(gI, "__esModule", { value: !0 });
var wQ = gI.ReadableWebToNodeStream = void 0;
const $s = js;
class A0 extends $s.Readable {
  /**
   *
   * @param stream Readable​Stream: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
   */
  constructor(t) {
    super(), this.bytesRead = 0, this.released = !1, this.reader = t.getReader();
  }
  /**
   * Implementation of readable._read(size).
   * When readable._read() is called, if data is available from the resource,
   * the implementation should begin pushing that data into the read queue
   * https://nodejs.org/api/stream.html#stream_readable_read_size_1
   */
  async _read() {
    if (this.released) {
      this.push(null);
      return;
    }
    this.pendingRead = this.reader.read();
    const t = await this.pendingRead;
    delete this.pendingRead, t.done || this.released ? this.push(null) : (this.bytesRead += t.value.length, this.push(t.value));
  }
  /**
   * If there is no unresolved read call to Web-API Readable​Stream immediately returns;
   * otherwise will wait until the read is resolved.
   */
  async waitForReadToComplete() {
    this.pendingRead && await this.pendingRead;
  }
  /**
   * Close wrapper
   */
  async close() {
    await this.syncAndRelease();
  }
  async syncAndRelease() {
    this.released = !0, await this.waitForReadToComplete(), await this.reader.releaseLock();
  }
}
wQ = gI.ReadableWebToNodeStream = A0;
function pA(e) {
  return new DataView(e.buffer, e.byteOffset);
}
const e0 = {
  len: 1,
  get(e, t) {
    return pA(e).getUint8(t);
  },
  put(e, t, A) {
    return pA(e).setUint8(t, A), t + 1;
  }
}, sg = {
  len: 2,
  get(e, t) {
    return pA(e).getUint16(t, !0);
  },
  put(e, t, A) {
    return pA(e).setUint16(t, A, !0), t + 2;
  }
}, Cg = {
  len: 2,
  get(e, t) {
    return pA(e).getUint16(t);
  },
  put(e, t, A) {
    return pA(e).setUint16(t, A), t + 2;
  }
}, t0 = {
  len: 4,
  get(e, t) {
    return pA(e).getUint32(t, !0);
  },
  put(e, t, A) {
    return pA(e).setUint32(t, A, !0), t + 4;
  }
}, i0 = {
  len: 4,
  get(e, t) {
    return pA(e).getUint32(t);
  },
  put(e, t, A) {
    return pA(e).setUint32(t, A), t + 4;
  }
}, B0 = {
  len: 4,
  get(e, t) {
    return pA(e).getInt32(t);
  },
  put(e, t, A) {
    return pA(e).setInt32(t, A), t + 4;
  }
}, g0 = {
  len: 8,
  get(e, t) {
    return pA(e).getBigUint64(t, !0);
  },
  put(e, t, A) {
    return pA(e).setBigUint64(t, A, !0), t + 8;
  }
};
class rt {
  constructor(t, A) {
    this.len = t, this.encoding = A;
  }
  get(t, A) {
    return Ae.from(t).toString(this.encoding, A, A + this.len);
  }
}
const n0 = "End-Of-Stream";
class UA extends Error {
  constructor() {
    super(n0);
  }
}
class I0 {
  constructor() {
    this.resolve = () => null, this.reject = () => null, this.promise = new Promise((t, A) => {
      this.reject = A, this.resolve = t;
    });
  }
}
const r0 = 1 * 1024 * 1024;
class E0 {
  constructor(t) {
    if (this.s = t, this.deferred = null, this.endOfStream = !1, this.peekQueue = [], !t.read || !t.once)
      throw new Error("Expected an instance of stream.Readable");
    this.s.once("end", () => this.reject(new UA())), this.s.once("error", (A) => this.reject(A)), this.s.once("close", () => this.reject(new Error("Stream closed")));
  }
  /**
   * Read ahead (peek) from stream. Subsequent read or peeks will return the same data
   * @param uint8Array - Uint8Array (or Buffer) to store data read from stream in
   * @param offset - Offset target
   * @param length - Number of bytes to read
   * @returns Number of bytes peeked
   */
  async peek(t, A, i) {
    const B = await this.read(t, A, i);
    return this.peekQueue.push(t.subarray(A, A + B)), B;
  }
  /**
   * Read chunk from stream
   * @param buffer - Target Uint8Array (or Buffer) to store data read from stream in
   * @param offset - Offset target
   * @param length - Number of bytes to read
   * @returns Number of bytes read
   */
  async read(t, A, i) {
    if (i === 0)
      return 0;
    if (this.peekQueue.length === 0 && this.endOfStream)
      throw new UA();
    let B = i, g = 0;
    for (; this.peekQueue.length > 0 && B > 0; ) {
      const n = this.peekQueue.pop();
      if (!n)
        throw new Error("peekData should be defined");
      const I = Math.min(n.length, B);
      t.set(n.subarray(0, I), A + g), g += I, B -= I, I < n.length && this.peekQueue.push(n.subarray(I));
    }
    for (; B > 0 && !this.endOfStream; ) {
      const n = Math.min(B, r0), I = await this.readFromStream(t, A + g, n);
      if (g += I, I < n)
        break;
      B -= I;
    }
    return g;
  }
  /**
   * Read chunk from stream
   * @param buffer Target Uint8Array (or Buffer) to store data read from stream in
   * @param offset Offset target
   * @param length Number of bytes to read
   * @returns Number of bytes read
   */
  async readFromStream(t, A, i) {
    const B = this.s.read(i);
    if (B)
      return t.set(B, A), B.length;
    {
      const g = {
        buffer: t,
        offset: A,
        length: i,
        deferred: new I0()
      };
      return this.deferred = g.deferred, this.s.once("readable", () => {
        this.readDeferred(g);
      }), g.deferred.promise;
    }
  }
  /**
   * Process deferred read request
   * @param request Deferred read request
   */
  readDeferred(t) {
    const A = this.s.read(t.length);
    A ? (t.buffer.set(A, t.offset), t.deferred.resolve(A.length), this.deferred = null) : this.s.once("readable", () => {
      this.readDeferred(t);
    });
  }
  reject(t) {
    this.endOfStream = !0, this.deferred && (this.deferred.reject(t), this.deferred = null);
  }
}
class yQ {
  constructor(t) {
    this.position = 0, this.numBuffer = new Uint8Array(8), this.fileInfo = t || {};
  }
  /**
   * Read a token from the tokenizer-stream
   * @param token - The token to read
   * @param position - If provided, the desired position in the tokenizer-stream
   * @returns Promise with token data
   */
  async readToken(t, A = this.position) {
    const i = Ae.alloc(t.len);
    if (await this.readBuffer(i, { position: A }) < t.len)
      throw new UA();
    return t.get(i, 0);
  }
  /**
   * Peek a token from the tokenizer-stream.
   * @param token - Token to peek from the tokenizer-stream.
   * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
   * @returns Promise with token data
   */
  async peekToken(t, A = this.position) {
    const i = Ae.alloc(t.len);
    if (await this.peekBuffer(i, { position: A }) < t.len)
      throw new UA();
    return t.get(i, 0);
  }
  /**
   * Read a numeric token from the stream
   * @param token - Numeric token
   * @returns Promise with number
   */
  async readNumber(t) {
    if (await this.readBuffer(this.numBuffer, { length: t.len }) < t.len)
      throw new UA();
    return t.get(this.numBuffer, 0);
  }
  /**
   * Read a numeric token from the stream
   * @param token - Numeric token
   * @returns Promise with number
   */
  async peekNumber(t) {
    if (await this.peekBuffer(this.numBuffer, { length: t.len }) < t.len)
      throw new UA();
    return t.get(this.numBuffer, 0);
  }
  /**
   * Ignore number of bytes, advances the pointer in under tokenizer-stream.
   * @param length - Number of bytes to ignore
   * @return resolves the number of bytes ignored, equals length if this available, otherwise the number of bytes available
   */
  async ignore(t) {
    if (this.fileInfo.size !== void 0) {
      const A = this.fileInfo.size - this.position;
      if (t > A)
        return this.position += A, A;
    }
    return this.position += t, t;
  }
  async close() {
  }
  normalizeOptions(t, A) {
    if (A && A.position !== void 0 && A.position < this.position)
      throw new Error("`options.position` must be equal or greater than `tokenizer.position`");
    return A ? {
      mayBeLess: A.mayBeLess === !0,
      offset: A.offset ? A.offset : 0,
      length: A.length ? A.length : t.length - (A.offset ? A.offset : 0),
      position: A.position ? A.position : this.position
    } : {
      mayBeLess: !1,
      offset: 0,
      length: t.length,
      position: this.position
    };
  }
}
const Q0 = 256e3;
class o0 extends yQ {
  constructor(t, A) {
    super(A), this.streamReader = new E0(t);
  }
  /**
   * Get file information, an HTTP-client may implement this doing a HEAD request
   * @return Promise with file information
   */
  async getFileInfo() {
    return this.fileInfo;
  }
  /**
   * Read buffer from tokenizer
   * @param uint8Array - Target Uint8Array to fill with data read from the tokenizer-stream
   * @param options - Read behaviour options
   * @returns Promise with number of bytes read
   */
  async readBuffer(t, A) {
    const i = this.normalizeOptions(t, A), B = i.position - this.position;
    if (B > 0)
      return await this.ignore(B), this.readBuffer(t, A);
    if (B < 0)
      throw new Error("`options.position` must be equal or greater than `tokenizer.position`");
    if (i.length === 0)
      return 0;
    const g = await this.streamReader.read(t, i.offset, i.length);
    if (this.position += g, (!A || !A.mayBeLess) && g < i.length)
      throw new UA();
    return g;
  }
  /**
   * Peek (read ahead) buffer from tokenizer
   * @param uint8Array - Uint8Array (or Buffer) to write data to
   * @param options - Read behaviour options
   * @returns Promise with number of bytes peeked
   */
  async peekBuffer(t, A) {
    const i = this.normalizeOptions(t, A);
    let B = 0;
    if (i.position) {
      const g = i.position - this.position;
      if (g > 0) {
        const n = new Uint8Array(i.length + g);
        return B = await this.peekBuffer(n, { mayBeLess: i.mayBeLess }), t.set(n.subarray(g), i.offset), B - g;
      } else if (g < 0)
        throw new Error("Cannot peek from a negative offset in a stream");
    }
    if (i.length > 0) {
      try {
        B = await this.streamReader.peek(t, i.offset, i.length);
      } catch (g) {
        if (A && A.mayBeLess && g instanceof UA)
          return 0;
        throw g;
      }
      if (!i.mayBeLess && B < i.length)
        throw new UA();
    }
    return B;
  }
  async ignore(t) {
    const A = Math.min(Q0, t), i = new Uint8Array(A);
    let B = 0;
    for (; B < t; ) {
      const g = t - B, n = await this.readBuffer(i, { length: Math.min(A, g) });
      if (n < 0)
        return n;
      B += n;
    }
    return B;
  }
}
class a0 extends yQ {
  /**
   * Construct BufferTokenizer
   * @param uint8Array - Uint8Array to tokenize
   * @param fileInfo - Pass additional file information to the tokenizer
   */
  constructor(t, A) {
    super(A), this.uint8Array = t, this.fileInfo.size = this.fileInfo.size ? this.fileInfo.size : t.length;
  }
  /**
   * Read buffer from tokenizer
   * @param uint8Array - Uint8Array to tokenize
   * @param options - Read behaviour options
   * @returns {Promise<number>}
   */
  async readBuffer(t, A) {
    if (A && A.position) {
      if (A.position < this.position)
        throw new Error("`options.position` must be equal or greater than `tokenizer.position`");
      this.position = A.position;
    }
    const i = await this.peekBuffer(t, A);
    return this.position += i, i;
  }
  /**
   * Peek (read ahead) buffer from tokenizer
   * @param uint8Array
   * @param options - Read behaviour options
   * @returns {Promise<number>}
   */
  async peekBuffer(t, A) {
    const i = this.normalizeOptions(t, A), B = Math.min(this.uint8Array.length - i.position, i.length);
    if (!i.mayBeLess && B < i.length)
      throw new UA();
    return t.set(this.uint8Array.subarray(i.position, i.position + B), i.offset), B;
  }
  async close() {
  }
}
function s0(e, t) {
  return t = t || {}, new o0(e, t);
}
function C0(e, t) {
  return new a0(e, t);
}
function c0(e) {
  return [...e].map((t) => t.charCodeAt(0));
}
function f0(e, t = 0) {
  const A = Number.parseInt(e.toString("utf8", 148, 154).replace(/\0.*$/, "").trim(), 8);
  if (Number.isNaN(A))
    return !1;
  let i = 8 * 32;
  for (let B = t; B < t + 148; B++)
    i += e[B];
  for (let B = t + 156; B < t + 512; B++)
    i += e[B];
  return A === i;
}
const u0 = {
  get: (e, t) => e[t + 3] & 127 | e[t + 2] << 7 | e[t + 1] << 14 | e[t] << 21,
  len: 4
}, x0 = [
  "jpg",
  "png",
  "apng",
  "gif",
  "webp",
  "flif",
  "xcf",
  "cr2",
  "cr3",
  "orf",
  "arw",
  "dng",
  "nef",
  "rw2",
  "raf",
  "tif",
  "bmp",
  "icns",
  "jxr",
  "psd",
  "indd",
  "zip",
  "tar",
  "rar",
  "gz",
  "bz2",
  "7z",
  "dmg",
  "mp4",
  "mid",
  "mkv",
  "webm",
  "mov",
  "avi",
  "mpg",
  "mp2",
  "mp3",
  "m4a",
  "oga",
  "ogg",
  "ogv",
  "opus",
  "flac",
  "wav",
  "spx",
  "amr",
  "pdf",
  "epub",
  "elf",
  "macho",
  "exe",
  "swf",
  "rtf",
  "wasm",
  "woff",
  "woff2",
  "eot",
  "ttf",
  "otf",
  "ico",
  "flv",
  "ps",
  "xz",
  "sqlite",
  "nes",
  "crx",
  "xpi",
  "cab",
  "deb",
  "ar",
  "rpm",
  "Z",
  "lz",
  "cfb",
  "mxf",
  "mts",
  "blend",
  "bpg",
  "docx",
  "pptx",
  "xlsx",
  "3gp",
  "3g2",
  "j2c",
  "jp2",
  "jpm",
  "jpx",
  "mj2",
  "aif",
  "qcp",
  "odt",
  "ods",
  "odp",
  "xml",
  "mobi",
  "heic",
  "cur",
  "ktx",
  "ape",
  "wv",
  "dcm",
  "ics",
  "glb",
  "pcap",
  "dsf",
  "lnk",
  "alias",
  "voc",
  "ac3",
  "m4v",
  "m4p",
  "m4b",
  "f4v",
  "f4p",
  "f4b",
  "f4a",
  "mie",
  "asf",
  "ogm",
  "ogx",
  "mpc",
  "arrow",
  "shp",
  "aac",
  "mp1",
  "it",
  "s3m",
  "xm",
  "ai",
  "skp",
  "avif",
  "eps",
  "lzh",
  "pgp",
  "asar",
  "stl",
  "chm",
  "3mf",
  "zst",
  "jxl",
  "vcf",
  "jls",
  "pst",
  "dwg",
  "parquet",
  "class",
  "arj",
  "cpio",
  "ace",
  "avro",
  "icc",
  "fbx"
], h0 = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/flif",
  "image/x-xcf",
  "image/x-canon-cr2",
  "image/x-canon-cr3",
  "image/tiff",
  "image/bmp",
  "image/vnd.ms-photo",
  "image/vnd.adobe.photoshop",
  "application/x-indesign",
  "application/epub+zip",
  "application/x-xpinstall",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-tar",
  "application/x-rar-compressed",
  "application/gzip",
  "application/x-bzip2",
  "application/x-7z-compressed",
  "application/x-apple-diskimage",
  "application/x-apache-arrow",
  "video/mp4",
  "audio/midi",
  "video/x-matroska",
  "video/webm",
  "video/quicktime",
  "video/vnd.avi",
  "audio/wav",
  "audio/qcelp",
  "audio/x-ms-asf",
  "video/x-ms-asf",
  "application/vnd.ms-asf",
  "video/mpeg",
  "video/3gpp",
  "audio/mpeg",
  "audio/mp4",
  // RFC 4337
  "audio/opus",
  "video/ogg",
  "audio/ogg",
  "application/ogg",
  "audio/x-flac",
  "audio/ape",
  "audio/wavpack",
  "audio/amr",
  "application/pdf",
  "application/x-elf",
  "application/x-mach-binary",
  "application/x-msdownload",
  "application/x-shockwave-flash",
  "application/rtf",
  "application/wasm",
  "font/woff",
  "font/woff2",
  "application/vnd.ms-fontobject",
  "font/ttf",
  "font/otf",
  "image/x-icon",
  "video/x-flv",
  "application/postscript",
  "application/eps",
  "application/x-xz",
  "application/x-sqlite3",
  "application/x-nintendo-nes-rom",
  "application/x-google-chrome-extension",
  "application/vnd.ms-cab-compressed",
  "application/x-deb",
  "application/x-unix-archive",
  "application/x-rpm",
  "application/x-compress",
  "application/x-lzip",
  "application/x-cfb",
  "application/x-mie",
  "application/mxf",
  "video/mp2t",
  "application/x-blender",
  "image/bpg",
  "image/j2c",
  "image/jp2",
  "image/jpx",
  "image/jpm",
  "image/mj2",
  "audio/aiff",
  "application/xml",
  "application/x-mobipocket-ebook",
  "image/heif",
  "image/heif-sequence",
  "image/heic",
  "image/heic-sequence",
  "image/icns",
  "image/ktx",
  "application/dicom",
  "audio/x-musepack",
  "text/calendar",
  "text/vcard",
  "model/gltf-binary",
  "application/vnd.tcpdump.pcap",
  "audio/x-dsf",
  // Non-standard
  "application/x.ms.shortcut",
  // Invented by us
  "application/x.apple.alias",
  // Invented by us
  "audio/x-voc",
  "audio/vnd.dolby.dd-raw",
  "audio/x-m4a",
  "image/apng",
  "image/x-olympus-orf",
  "image/x-sony-arw",
  "image/x-adobe-dng",
  "image/x-nikon-nef",
  "image/x-panasonic-rw2",
  "image/x-fujifilm-raf",
  "video/x-m4v",
  "video/3gpp2",
  "application/x-esri-shape",
  "audio/aac",
  "audio/x-it",
  "audio/x-s3m",
  "audio/x-xm",
  "video/MP1S",
  "video/MP2P",
  "application/vnd.sketchup.skp",
  "image/avif",
  "application/x-lzh-compressed",
  "application/pgp-encrypted",
  "application/x-asar",
  "model/stl",
  "application/vnd.ms-htmlhelp",
  "model/3mf",
  "image/jxl",
  "application/zstd",
  "image/jls",
  "application/vnd.ms-outlook",
  "image/vnd.dwg",
  "application/x-parquet",
  "application/java-vm",
  "application/x-arj",
  "application/x-cpio",
  "application/x-ace-compressed",
  "application/avro",
  "application/vnd.iccprofile",
  "application/x.autodesk.fbx"
  // Invented by us
], ar = 4100;
async function d0(e) {
  return new cB().fromStream(e);
}
async function l0(e) {
  return new cB().fromBuffer(e);
}
function ue(e, t, A) {
  A = {
    offset: 0,
    ...A
  };
  for (const [i, B] of t.entries())
    if (A.mask) {
      if (B !== (A.mask[i] & e[i + A.offset]))
        return !1;
    } else if (B !== e[i + A.offset])
      return !1;
  return !0;
}
async function w0(e) {
  return new cB().fromTokenizer(e);
}
class cB {
  constructor(t) {
    this.detectors = t == null ? void 0 : t.customDetectors, this.fromTokenizer = this.fromTokenizer.bind(this), this.fromBuffer = this.fromBuffer.bind(this), this.parse = this.parse.bind(this);
  }
  async fromTokenizer(t) {
    const A = t.position;
    for (const i of this.detectors || []) {
      const B = await i(t);
      if (B)
        return B;
      if (A !== t.position)
        return;
    }
    return this.parse(t);
  }
  async fromBuffer(t) {
    if (!(t instanceof Uint8Array || t instanceof ArrayBuffer))
      throw new TypeError(`Expected the \`input\` argument to be of type \`Uint8Array\` or \`Buffer\` or \`ArrayBuffer\`, got \`${typeof t}\``);
    const A = t instanceof Uint8Array ? t : new Uint8Array(t);
    if ((A == null ? void 0 : A.length) > 1)
      return this.fromTokenizer(C0(A));
  }
  async fromBlob(t) {
    const A = await t.arrayBuffer();
    return this.fromBuffer(new Uint8Array(A));
  }
  async fromStream(t) {
    const A = await s0(t);
    try {
      return await this.fromTokenizer(A);
    } finally {
      await A.close();
    }
  }
  async toDetectionStream(t, A = {}) {
    const { default: i } = await import("node:stream"), { sampleSize: B = ar } = A;
    return new Promise((g, n) => {
      t.on("error", n), t.once("readable", () => {
        (async () => {
          try {
            const I = new i.PassThrough(), r = i.pipeline ? i.pipeline(t, I, () => {
            }) : t.pipe(I), a = t.read(B) ?? t.read() ?? Ae.alloc(0);
            try {
              I.fileType = await this.fromBuffer(a);
            } catch (Q) {
              Q instanceof UA ? I.fileType = void 0 : n(Q);
            }
            g(r);
          } catch (I) {
            n(I);
          }
        })();
      });
    });
  }
  check(t, A) {
    return ue(this.buffer, t, A);
  }
  checkString(t, A) {
    return this.check(c0(t), A);
  }
  async parse(t) {
    if (this.buffer = Ae.alloc(ar), t.fileInfo.size === void 0 && (t.fileInfo.size = Number.MAX_SAFE_INTEGER), this.tokenizer = t, await t.peekBuffer(this.buffer, { length: 12, mayBeLess: !0 }), this.check([66, 77]))
      return {
        ext: "bmp",
        mime: "image/bmp"
      };
    if (this.check([11, 119]))
      return {
        ext: "ac3",
        mime: "audio/vnd.dolby.dd-raw"
      };
    if (this.check([120, 1]))
      return {
        ext: "dmg",
        mime: "application/x-apple-diskimage"
      };
    if (this.check([77, 90]))
      return {
        ext: "exe",
        mime: "application/x-msdownload"
      };
    if (this.check([37, 33]))
      return await t.peekBuffer(this.buffer, { length: 24, mayBeLess: !0 }), this.checkString("PS-Adobe-", { offset: 2 }) && this.checkString(" EPSF-", { offset: 14 }) ? {
        ext: "eps",
        mime: "application/eps"
      } : {
        ext: "ps",
        mime: "application/postscript"
      };
    if (this.check([31, 160]) || this.check([31, 157]))
      return {
        ext: "Z",
        mime: "application/x-compress"
      };
    if (this.check([199, 113]))
      return {
        ext: "cpio",
        mime: "application/x-cpio"
      };
    if (this.check([96, 234]))
      return {
        ext: "arj",
        mime: "application/x-arj"
      };
    if (this.check([239, 187, 191]))
      return this.tokenizer.ignore(3), this.parse(t);
    if (this.check([71, 73, 70]))
      return {
        ext: "gif",
        mime: "image/gif"
      };
    if (this.check([73, 73, 188]))
      return {
        ext: "jxr",
        mime: "image/vnd.ms-photo"
      };
    if (this.check([31, 139, 8]))
      return {
        ext: "gz",
        mime: "application/gzip"
      };
    if (this.check([66, 90, 104]))
      return {
        ext: "bz2",
        mime: "application/x-bzip2"
      };
    if (this.checkString("ID3")) {
      await t.ignore(6);
      const A = await t.readToken(u0);
      return t.position + A > t.fileInfo.size ? {
        ext: "mp3",
        mime: "audio/mpeg"
      } : (await t.ignore(A), this.fromTokenizer(t));
    }
    if (this.checkString("MP+"))
      return {
        ext: "mpc",
        mime: "audio/x-musepack"
      };
    if ((this.buffer[0] === 67 || this.buffer[0] === 70) && this.check([87, 83], { offset: 1 }))
      return {
        ext: "swf",
        mime: "application/x-shockwave-flash"
      };
    if (this.check([255, 216, 255]))
      return this.check([247], { offset: 3 }) ? {
        ext: "jls",
        mime: "image/jls"
      } : {
        ext: "jpg",
        mime: "image/jpeg"
      };
    if (this.check([79, 98, 106, 1]))
      return {
        ext: "avro",
        mime: "application/avro"
      };
    if (this.checkString("FLIF"))
      return {
        ext: "flif",
        mime: "image/flif"
      };
    if (this.checkString("8BPS"))
      return {
        ext: "psd",
        mime: "image/vnd.adobe.photoshop"
      };
    if (this.checkString("WEBP", { offset: 8 }))
      return {
        ext: "webp",
        mime: "image/webp"
      };
    if (this.checkString("MPCK"))
      return {
        ext: "mpc",
        mime: "audio/x-musepack"
      };
    if (this.checkString("FORM"))
      return {
        ext: "aif",
        mime: "audio/aiff"
      };
    if (this.checkString("icns", { offset: 0 }))
      return {
        ext: "icns",
        mime: "image/icns"
      };
    if (this.check([80, 75, 3, 4])) {
      try {
        for (; t.position + 30 < t.fileInfo.size; ) {
          await t.readBuffer(this.buffer, { length: 30 });
          const A = {
            compressedSize: this.buffer.readUInt32LE(18),
            uncompressedSize: this.buffer.readUInt32LE(22),
            filenameLength: this.buffer.readUInt16LE(26),
            extraFieldLength: this.buffer.readUInt16LE(28)
          };
          if (A.filename = await t.readToken(new rt(A.filenameLength, "utf-8")), await t.ignore(A.extraFieldLength), A.filename === "META-INF/mozilla.rsa")
            return {
              ext: "xpi",
              mime: "application/x-xpinstall"
            };
          if (A.filename.endsWith(".rels") || A.filename.endsWith(".xml"))
            switch (A.filename.split("/")[0]) {
              case "_rels":
                break;
              case "word":
                return {
                  ext: "docx",
                  mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                };
              case "ppt":
                return {
                  ext: "pptx",
                  mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
                };
              case "xl":
                return {
                  ext: "xlsx",
                  mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                };
              default:
                break;
            }
          if (A.filename.startsWith("xl/"))
            return {
              ext: "xlsx",
              mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            };
          if (A.filename.startsWith("3D/") && A.filename.endsWith(".model"))
            return {
              ext: "3mf",
              mime: "model/3mf"
            };
          if (A.filename === "mimetype" && A.compressedSize === A.uncompressedSize) {
            let i = await t.readToken(new rt(A.compressedSize, "utf-8"));
            switch (i = i.trim(), i) {
              case "application/epub+zip":
                return {
                  ext: "epub",
                  mime: "application/epub+zip"
                };
              case "application/vnd.oasis.opendocument.text":
                return {
                  ext: "odt",
                  mime: "application/vnd.oasis.opendocument.text"
                };
              case "application/vnd.oasis.opendocument.spreadsheet":
                return {
                  ext: "ods",
                  mime: "application/vnd.oasis.opendocument.spreadsheet"
                };
              case "application/vnd.oasis.opendocument.presentation":
                return {
                  ext: "odp",
                  mime: "application/vnd.oasis.opendocument.presentation"
                };
              default:
            }
          }
          if (A.compressedSize === 0) {
            let i = -1;
            for (; i < 0 && t.position < t.fileInfo.size; )
              await t.peekBuffer(this.buffer, { mayBeLess: !0 }), i = this.buffer.indexOf("504B0304", 0, "hex"), await t.ignore(i >= 0 ? i : this.buffer.length);
          } else
            await t.ignore(A.compressedSize);
        }
      } catch (A) {
        if (!(A instanceof UA))
          throw A;
      }
      return {
        ext: "zip",
        mime: "application/zip"
      };
    }
    if (this.checkString("OggS")) {
      await t.ignore(28);
      const A = Ae.alloc(8);
      return await t.readBuffer(A), ue(A, [79, 112, 117, 115, 72, 101, 97, 100]) ? {
        ext: "opus",
        mime: "audio/opus"
      } : ue(A, [128, 116, 104, 101, 111, 114, 97]) ? {
        ext: "ogv",
        mime: "video/ogg"
      } : ue(A, [1, 118, 105, 100, 101, 111, 0]) ? {
        ext: "ogm",
        mime: "video/ogg"
      } : ue(A, [127, 70, 76, 65, 67]) ? {
        ext: "oga",
        mime: "audio/ogg"
      } : ue(A, [83, 112, 101, 101, 120, 32, 32]) ? {
        ext: "spx",
        mime: "audio/ogg"
      } : ue(A, [1, 118, 111, 114, 98, 105, 115]) ? {
        ext: "ogg",
        mime: "audio/ogg"
      } : {
        ext: "ogx",
        mime: "application/ogg"
      };
    }
    if (this.check([80, 75]) && (this.buffer[2] === 3 || this.buffer[2] === 5 || this.buffer[2] === 7) && (this.buffer[3] === 4 || this.buffer[3] === 6 || this.buffer[3] === 8))
      return {
        ext: "zip",
        mime: "application/zip"
      };
    if (this.checkString("ftyp", { offset: 4 }) && this.buffer[8] & 96) {
      const A = this.buffer.toString("binary", 8, 12).replace("\0", " ").trim();
      switch (A) {
        case "avif":
        case "avis":
          return { ext: "avif", mime: "image/avif" };
        case "mif1":
          return { ext: "heic", mime: "image/heif" };
        case "msf1":
          return { ext: "heic", mime: "image/heif-sequence" };
        case "heic":
        case "heix":
          return { ext: "heic", mime: "image/heic" };
        case "hevc":
        case "hevx":
          return { ext: "heic", mime: "image/heic-sequence" };
        case "qt":
          return { ext: "mov", mime: "video/quicktime" };
        case "M4V":
        case "M4VH":
        case "M4VP":
          return { ext: "m4v", mime: "video/x-m4v" };
        case "M4P":
          return { ext: "m4p", mime: "video/mp4" };
        case "M4B":
          return { ext: "m4b", mime: "audio/mp4" };
        case "M4A":
          return { ext: "m4a", mime: "audio/x-m4a" };
        case "F4V":
          return { ext: "f4v", mime: "video/mp4" };
        case "F4P":
          return { ext: "f4p", mime: "video/mp4" };
        case "F4A":
          return { ext: "f4a", mime: "audio/mp4" };
        case "F4B":
          return { ext: "f4b", mime: "audio/mp4" };
        case "crx":
          return { ext: "cr3", mime: "image/x-canon-cr3" };
        default:
          return A.startsWith("3g") ? A.startsWith("3g2") ? { ext: "3g2", mime: "video/3gpp2" } : { ext: "3gp", mime: "video/3gpp" } : { ext: "mp4", mime: "video/mp4" };
      }
    }
    if (this.checkString("MThd"))
      return {
        ext: "mid",
        mime: "audio/midi"
      };
    if (this.checkString("wOFF") && (this.check([0, 1, 0, 0], { offset: 4 }) || this.checkString("OTTO", { offset: 4 })))
      return {
        ext: "woff",
        mime: "font/woff"
      };
    if (this.checkString("wOF2") && (this.check([0, 1, 0, 0], { offset: 4 }) || this.checkString("OTTO", { offset: 4 })))
      return {
        ext: "woff2",
        mime: "font/woff2"
      };
    if (this.check([212, 195, 178, 161]) || this.check([161, 178, 195, 212]))
      return {
        ext: "pcap",
        mime: "application/vnd.tcpdump.pcap"
      };
    if (this.checkString("DSD "))
      return {
        ext: "dsf",
        mime: "audio/x-dsf"
        // Non-standard
      };
    if (this.checkString("LZIP"))
      return {
        ext: "lz",
        mime: "application/x-lzip"
      };
    if (this.checkString("fLaC"))
      return {
        ext: "flac",
        mime: "audio/x-flac"
      };
    if (this.check([66, 80, 71, 251]))
      return {
        ext: "bpg",
        mime: "image/bpg"
      };
    if (this.checkString("wvpk"))
      return {
        ext: "wv",
        mime: "audio/wavpack"
      };
    if (this.checkString("%PDF")) {
      try {
        await t.ignore(1350);
        const A = 10 * 1024 * 1024, i = Ae.alloc(Math.min(A, t.fileInfo.size));
        if (await t.readBuffer(i, { mayBeLess: !0 }), i.includes(Ae.from("AIPrivateData")))
          return {
            ext: "ai",
            mime: "application/postscript"
          };
      } catch (A) {
        if (!(A instanceof UA))
          throw A;
      }
      return {
        ext: "pdf",
        mime: "application/pdf"
      };
    }
    if (this.check([0, 97, 115, 109]))
      return {
        ext: "wasm",
        mime: "application/wasm"
      };
    if (this.check([73, 73])) {
      const A = await this.readTiffHeader(!1);
      if (A)
        return A;
    }
    if (this.check([77, 77])) {
      const A = await this.readTiffHeader(!0);
      if (A)
        return A;
    }
    if (this.checkString("MAC "))
      return {
        ext: "ape",
        mime: "audio/ape"
      };
    if (this.check([26, 69, 223, 163])) {
      async function A() {
        const I = await t.peekNumber(e0);
        let r = 128, a = 0;
        for (; !(I & r) && r !== 0; )
          ++a, r >>= 1;
        const Q = Ae.alloc(a + 1);
        return await t.readBuffer(Q), Q;
      }
      async function i() {
        const I = await A(), r = await A();
        r[0] ^= 128 >> r.length - 1;
        const a = Math.min(6, r.length);
        return {
          id: I.readUIntBE(0, I.length),
          len: r.readUIntBE(r.length - a, a)
        };
      }
      async function B(I) {
        for (; I > 0; ) {
          const r = await i();
          if (r.id === 17026)
            return (await t.readToken(new rt(r.len, "utf-8"))).replaceAll(/\00.*$/g, "");
          await t.ignore(r.len), --I;
        }
      }
      const g = await i();
      switch (await B(g.len)) {
        case "webm":
          return {
            ext: "webm",
            mime: "video/webm"
          };
        case "matroska":
          return {
            ext: "mkv",
            mime: "video/x-matroska"
          };
        default:
          return;
      }
    }
    if (this.check([82, 73, 70, 70])) {
      if (this.check([65, 86, 73], { offset: 8 }))
        return {
          ext: "avi",
          mime: "video/vnd.avi"
        };
      if (this.check([87, 65, 86, 69], { offset: 8 }))
        return {
          ext: "wav",
          mime: "audio/wav"
        };
      if (this.check([81, 76, 67, 77], { offset: 8 }))
        return {
          ext: "qcp",
          mime: "audio/qcelp"
        };
    }
    if (this.checkString("SQLi"))
      return {
        ext: "sqlite",
        mime: "application/x-sqlite3"
      };
    if (this.check([78, 69, 83, 26]))
      return {
        ext: "nes",
        mime: "application/x-nintendo-nes-rom"
      };
    if (this.checkString("Cr24"))
      return {
        ext: "crx",
        mime: "application/x-google-chrome-extension"
      };
    if (this.checkString("MSCF") || this.checkString("ISc("))
      return {
        ext: "cab",
        mime: "application/vnd.ms-cab-compressed"
      };
    if (this.check([237, 171, 238, 219]))
      return {
        ext: "rpm",
        mime: "application/x-rpm"
      };
    if (this.check([197, 208, 211, 198]))
      return {
        ext: "eps",
        mime: "application/eps"
      };
    if (this.check([40, 181, 47, 253]))
      return {
        ext: "zst",
        mime: "application/zstd"
      };
    if (this.check([127, 69, 76, 70]))
      return {
        ext: "elf",
        mime: "application/x-elf"
      };
    if (this.check([33, 66, 68, 78]))
      return {
        ext: "pst",
        mime: "application/vnd.ms-outlook"
      };
    if (this.checkString("PAR1"))
      return {
        ext: "parquet",
        mime: "application/x-parquet"
      };
    if (this.check([207, 250, 237, 254]))
      return {
        ext: "macho",
        mime: "application/x-mach-binary"
      };
    if (this.check([79, 84, 84, 79, 0]))
      return {
        ext: "otf",
        mime: "font/otf"
      };
    if (this.checkString("#!AMR"))
      return {
        ext: "amr",
        mime: "audio/amr"
      };
    if (this.checkString("{\\rtf"))
      return {
        ext: "rtf",
        mime: "application/rtf"
      };
    if (this.check([70, 76, 86, 1]))
      return {
        ext: "flv",
        mime: "video/x-flv"
      };
    if (this.checkString("IMPM"))
      return {
        ext: "it",
        mime: "audio/x-it"
      };
    if (this.checkString("-lh0-", { offset: 2 }) || this.checkString("-lh1-", { offset: 2 }) || this.checkString("-lh2-", { offset: 2 }) || this.checkString("-lh3-", { offset: 2 }) || this.checkString("-lh4-", { offset: 2 }) || this.checkString("-lh5-", { offset: 2 }) || this.checkString("-lh6-", { offset: 2 }) || this.checkString("-lh7-", { offset: 2 }) || this.checkString("-lzs-", { offset: 2 }) || this.checkString("-lz4-", { offset: 2 }) || this.checkString("-lz5-", { offset: 2 }) || this.checkString("-lhd-", { offset: 2 }))
      return {
        ext: "lzh",
        mime: "application/x-lzh-compressed"
      };
    if (this.check([0, 0, 1, 186])) {
      if (this.check([33], { offset: 4, mask: [241] }))
        return {
          ext: "mpg",
          // May also be .ps, .mpeg
          mime: "video/MP1S"
        };
      if (this.check([68], { offset: 4, mask: [196] }))
        return {
          ext: "mpg",
          // May also be .mpg, .m2p, .vob or .sub
          mime: "video/MP2P"
        };
    }
    if (this.checkString("ITSF"))
      return {
        ext: "chm",
        mime: "application/vnd.ms-htmlhelp"
      };
    if (this.check([202, 254, 186, 190]))
      return {
        ext: "class",
        mime: "application/java-vm"
      };
    if (this.check([253, 55, 122, 88, 90, 0]))
      return {
        ext: "xz",
        mime: "application/x-xz"
      };
    if (this.checkString("<?xml "))
      return {
        ext: "xml",
        mime: "application/xml"
      };
    if (this.check([55, 122, 188, 175, 39, 28]))
      return {
        ext: "7z",
        mime: "application/x-7z-compressed"
      };
    if (this.check([82, 97, 114, 33, 26, 7]) && (this.buffer[6] === 0 || this.buffer[6] === 1))
      return {
        ext: "rar",
        mime: "application/x-rar-compressed"
      };
    if (this.checkString("solid "))
      return {
        ext: "stl",
        mime: "model/stl"
      };
    if (this.checkString("AC")) {
      const A = this.buffer.toString("binary", 2, 6);
      if (A.match("^d*") && A >= 1e3 && A <= 1050)
        return {
          ext: "dwg",
          mime: "image/vnd.dwg"
        };
    }
    if (this.checkString("070707"))
      return {
        ext: "cpio",
        mime: "application/x-cpio"
      };
    if (this.checkString("BLENDER"))
      return {
        ext: "blend",
        mime: "application/x-blender"
      };
    if (this.checkString("!<arch>"))
      return await t.ignore(8), await t.readToken(new rt(13, "ascii")) === "debian-binary" ? {
        ext: "deb",
        mime: "application/x-deb"
      } : {
        ext: "ar",
        mime: "application/x-unix-archive"
      };
    if (this.checkString("**ACE", { offset: 7 }) && (await t.peekBuffer(this.buffer, { length: 14, mayBeLess: !0 }), this.checkString("**", { offset: 12 })))
      return {
        ext: "ace",
        mime: "application/x-ace-compressed"
      };
    if (this.check([137, 80, 78, 71, 13, 10, 26, 10])) {
      await t.ignore(8);
      async function A() {
        return {
          length: await t.readToken(B0),
          type: await t.readToken(new rt(4, "binary"))
        };
      }
      do {
        const i = await A();
        if (i.length < 0)
          return;
        switch (i.type) {
          case "IDAT":
            return {
              ext: "png",
              mime: "image/png"
            };
          case "acTL":
            return {
              ext: "apng",
              mime: "image/apng"
            };
          default:
            await t.ignore(i.length + 4);
        }
      } while (t.position + 8 < t.fileInfo.size);
      return {
        ext: "png",
        mime: "image/png"
      };
    }
    if (this.check([65, 82, 82, 79, 87, 49, 0, 0]))
      return {
        ext: "arrow",
        mime: "application/x-apache-arrow"
      };
    if (this.check([103, 108, 84, 70, 2, 0, 0, 0]))
      return {
        ext: "glb",
        mime: "model/gltf-binary"
      };
    if (this.check([102, 114, 101, 101], { offset: 4 }) || this.check([109, 100, 97, 116], { offset: 4 }) || this.check([109, 111, 111, 118], { offset: 4 }) || this.check([119, 105, 100, 101], { offset: 4 }))
      return {
        ext: "mov",
        mime: "video/quicktime"
      };
    if (this.check([73, 73, 82, 79, 8, 0, 0, 0, 24]))
      return {
        ext: "orf",
        mime: "image/x-olympus-orf"
      };
    if (this.checkString("gimp xcf "))
      return {
        ext: "xcf",
        mime: "image/x-xcf"
      };
    if (this.check([73, 73, 85, 0, 24, 0, 0, 0, 136, 231, 116, 216]))
      return {
        ext: "rw2",
        mime: "image/x-panasonic-rw2"
      };
    if (this.check([48, 38, 178, 117, 142, 102, 207, 17, 166, 217])) {
      async function A() {
        const i = Ae.alloc(16);
        return await t.readBuffer(i), {
          id: i,
          size: Number(await t.readToken(g0))
        };
      }
      for (await t.ignore(30); t.position + 24 < t.fileInfo.size; ) {
        const i = await A();
        let B = i.size - 24;
        if (ue(i.id, [145, 7, 220, 183, 183, 169, 207, 17, 142, 230, 0, 192, 12, 32, 83, 101])) {
          const g = Ae.alloc(16);
          if (B -= await t.readBuffer(g), ue(g, [64, 158, 105, 248, 77, 91, 207, 17, 168, 253, 0, 128, 95, 92, 68, 43]))
            return {
              ext: "asf",
              mime: "audio/x-ms-asf"
            };
          if (ue(g, [192, 239, 25, 188, 77, 91, 207, 17, 168, 253, 0, 128, 95, 92, 68, 43]))
            return {
              ext: "asf",
              mime: "video/x-ms-asf"
            };
          break;
        }
        await t.ignore(B);
      }
      return {
        ext: "asf",
        mime: "application/vnd.ms-asf"
      };
    }
    if (this.check([171, 75, 84, 88, 32, 49, 49, 187, 13, 10, 26, 10]))
      return {
        ext: "ktx",
        mime: "image/ktx"
      };
    if ((this.check([126, 16, 4]) || this.check([126, 24, 4])) && this.check([48, 77, 73, 69], { offset: 4 }))
      return {
        ext: "mie",
        mime: "application/x-mie"
      };
    if (this.check([39, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], { offset: 2 }))
      return {
        ext: "shp",
        mime: "application/x-esri-shape"
      };
    if (this.check([255, 79, 255, 81]))
      return {
        ext: "j2c",
        mime: "image/j2c"
      };
    if (this.check([0, 0, 0, 12, 106, 80, 32, 32, 13, 10, 135, 10]))
      switch (await t.ignore(20), await t.readToken(new rt(4, "ascii"))) {
        case "jp2 ":
          return {
            ext: "jp2",
            mime: "image/jp2"
          };
        case "jpx ":
          return {
            ext: "jpx",
            mime: "image/jpx"
          };
        case "jpm ":
          return {
            ext: "jpm",
            mime: "image/jpm"
          };
        case "mjp2":
          return {
            ext: "mj2",
            mime: "image/mj2"
          };
        default:
          return;
      }
    if (this.check([255, 10]) || this.check([0, 0, 0, 12, 74, 88, 76, 32, 13, 10, 135, 10]))
      return {
        ext: "jxl",
        mime: "image/jxl"
      };
    if (this.check([254, 255]))
      return this.check([0, 60, 0, 63, 0, 120, 0, 109, 0, 108], { offset: 2 }) ? {
        ext: "xml",
        mime: "application/xml"
      } : void 0;
    if (this.check([0, 0, 1, 186]) || this.check([0, 0, 1, 179]))
      return {
        ext: "mpg",
        mime: "video/mpeg"
      };
    if (this.check([0, 1, 0, 0, 0]))
      return {
        ext: "ttf",
        mime: "font/ttf"
      };
    if (this.check([0, 0, 1, 0]))
      return {
        ext: "ico",
        mime: "image/x-icon"
      };
    if (this.check([0, 0, 2, 0]))
      return {
        ext: "cur",
        mime: "image/x-icon"
      };
    if (this.check([208, 207, 17, 224, 161, 177, 26, 225]))
      return {
        ext: "cfb",
        mime: "application/x-cfb"
      };
    if (await t.peekBuffer(this.buffer, { length: Math.min(256, t.fileInfo.size), mayBeLess: !0 }), this.check([97, 99, 115, 112], { offset: 36 }))
      return {
        ext: "icc",
        mime: "application/vnd.iccprofile"
      };
    if (this.checkString("BEGIN:")) {
      if (this.checkString("VCARD", { offset: 6 }))
        return {
          ext: "vcf",
          mime: "text/vcard"
        };
      if (this.checkString("VCALENDAR", { offset: 6 }))
        return {
          ext: "ics",
          mime: "text/calendar"
        };
    }
    if (this.checkString("FUJIFILMCCD-RAW"))
      return {
        ext: "raf",
        mime: "image/x-fujifilm-raf"
      };
    if (this.checkString("Extended Module:"))
      return {
        ext: "xm",
        mime: "audio/x-xm"
      };
    if (this.checkString("Creative Voice File"))
      return {
        ext: "voc",
        mime: "audio/x-voc"
      };
    if (this.check([4, 0, 0, 0]) && this.buffer.length >= 16) {
      const A = this.buffer.readUInt32LE(12);
      if (A > 12 && this.buffer.length >= A + 16)
        try {
          const i = this.buffer.slice(16, A + 16).toString();
          if (JSON.parse(i).files)
            return {
              ext: "asar",
              mime: "application/x-asar"
            };
        } catch {
        }
    }
    if (this.check([6, 14, 43, 52, 2, 5, 1, 1, 13, 1, 2, 1, 1, 2]))
      return {
        ext: "mxf",
        mime: "application/mxf"
      };
    if (this.checkString("SCRM", { offset: 44 }))
      return {
        ext: "s3m",
        mime: "audio/x-s3m"
      };
    if (this.check([71]) && this.check([71], { offset: 188 }))
      return {
        ext: "mts",
        mime: "video/mp2t"
      };
    if (this.check([71], { offset: 4 }) && this.check([71], { offset: 196 }))
      return {
        ext: "mts",
        mime: "video/mp2t"
      };
    if (this.check([66, 79, 79, 75, 77, 79, 66, 73], { offset: 60 }))
      return {
        ext: "mobi",
        mime: "application/x-mobipocket-ebook"
      };
    if (this.check([68, 73, 67, 77], { offset: 128 }))
      return {
        ext: "dcm",
        mime: "application/dicom"
      };
    if (this.check([76, 0, 0, 0, 1, 20, 2, 0, 0, 0, 0, 0, 192, 0, 0, 0, 0, 0, 0, 70]))
      return {
        ext: "lnk",
        mime: "application/x.ms.shortcut"
        // Invented by us
      };
    if (this.check([98, 111, 111, 107, 0, 0, 0, 0, 109, 97, 114, 107, 0, 0, 0, 0]))
      return {
        ext: "alias",
        mime: "application/x.apple.alias"
        // Invented by us
      };
    if (this.checkString("Kaydara FBX Binary  \0"))
      return {
        ext: "fbx",
        mime: "application/x.autodesk.fbx"
        // Invented by us
      };
    if (this.check([76, 80], { offset: 34 }) && (this.check([0, 0, 1], { offset: 8 }) || this.check([1, 0, 2], { offset: 8 }) || this.check([2, 0, 2], { offset: 8 })))
      return {
        ext: "eot",
        mime: "application/vnd.ms-fontobject"
      };
    if (this.check([6, 6, 237, 245, 216, 29, 70, 229, 189, 49, 239, 231, 254, 116, 183, 29]))
      return {
        ext: "indd",
        mime: "application/x-indesign"
      };
    if (await t.peekBuffer(this.buffer, { length: Math.min(512, t.fileInfo.size), mayBeLess: !0 }), f0(this.buffer))
      return {
        ext: "tar",
        mime: "application/x-tar"
      };
    if (this.check([255, 254]))
      return this.check([60, 0, 63, 0, 120, 0, 109, 0, 108, 0], { offset: 2 }) ? {
        ext: "xml",
        mime: "application/xml"
      } : this.check([255, 14, 83, 0, 107, 0, 101, 0, 116, 0, 99, 0, 104, 0, 85, 0, 112, 0, 32, 0, 77, 0, 111, 0, 100, 0, 101, 0, 108, 0], { offset: 2 }) ? {
        ext: "skp",
        mime: "application/vnd.sketchup.skp"
      } : void 0;
    if (this.checkString("-----BEGIN PGP MESSAGE-----"))
      return {
        ext: "pgp",
        mime: "application/pgp-encrypted"
      };
    if (this.buffer.length >= 2 && this.check([255, 224], { offset: 0, mask: [255, 224] })) {
      if (this.check([16], { offset: 1, mask: [22] }))
        return this.check([8], { offset: 1, mask: [8] }) ? {
          ext: "aac",
          mime: "audio/aac"
        } : {
          ext: "aac",
          mime: "audio/aac"
        };
      if (this.check([2], { offset: 1, mask: [6] }))
        return {
          ext: "mp3",
          mime: "audio/mpeg"
        };
      if (this.check([4], { offset: 1, mask: [6] }))
        return {
          ext: "mp2",
          mime: "audio/mpeg"
        };
      if (this.check([6], { offset: 1, mask: [6] }))
        return {
          ext: "mp1",
          mime: "audio/mpeg"
        };
    }
  }
  async readTiffTag(t) {
    const A = await this.tokenizer.readToken(t ? Cg : sg);
    switch (this.tokenizer.ignore(10), A) {
      case 50341:
        return {
          ext: "arw",
          mime: "image/x-sony-arw"
        };
      case 50706:
        return {
          ext: "dng",
          mime: "image/x-adobe-dng"
        };
    }
  }
  async readTiffIFD(t) {
    const A = await this.tokenizer.readToken(t ? Cg : sg);
    for (let i = 0; i < A; ++i) {
      const B = await this.readTiffTag(t);
      if (B)
        return B;
    }
  }
  async readTiffHeader(t) {
    const A = (t ? Cg : sg).get(this.buffer, 2), i = (t ? i0 : t0).get(this.buffer, 4);
    if (A === 42) {
      if (i >= 6) {
        if (this.checkString("CR", { offset: 8 }))
          return {
            ext: "cr2",
            mime: "image/x-canon-cr2"
          };
        if (i >= 8 && (this.check([28, 0, 254, 0], { offset: 8 }) || this.check([31, 0, 11, 0], { offset: 8 })))
          return {
            ext: "nef",
            mime: "image/x-nikon-nef"
          };
      }
      return await this.tokenizer.ignore(i), await this.readTiffIFD(t) ?? {
        ext: "tif",
        mime: "image/tiff"
      };
    }
    if (A === 43)
      return {
        ext: "tif",
        mime: "image/tiff"
      };
  }
}
async function y0(e, t = {}) {
  return new cB().toDetectionStream(e, t);
}
new Set(x0);
new Set(h0);
async function D0(e) {
  const t = new wQ(e), A = await d0(t);
  return await t.close(), A;
}
const p0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  fileTypeFromBuffer: l0,
  fileTypeFromStream: D0,
  fileTypeFromTokenizer: w0,
  fileTypeStream: y0
}, Symbol.toStringTag, { value: "Module" }));
let Xt;
const m0 = new Uint8Array(16);
function G0() {
  if (!Xt && (Xt = typeof crypto < "u" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto), !Xt))
    throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
  return Xt(m0);
}
const fA = [];
for (let e = 0; e < 256; ++e)
  fA.push((e + 256).toString(16).slice(1));
function F0(e, t = 0) {
  return fA[e[t + 0]] + fA[e[t + 1]] + fA[e[t + 2]] + fA[e[t + 3]] + "-" + fA[e[t + 4]] + fA[e[t + 5]] + "-" + fA[e[t + 6]] + fA[e[t + 7]] + "-" + fA[e[t + 8]] + fA[e[t + 9]] + "-" + fA[e[t + 10]] + fA[e[t + 11]] + fA[e[t + 12]] + fA[e[t + 13]] + fA[e[t + 14]] + fA[e[t + 15]];
}
const R0 = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto), sr = {
  randomUUID: R0
};
function S0(e, t, A) {
  if (sr.randomUUID && !t && !e)
    return sr.randomUUID();
  e = e || {};
  const i = e.random || (e.rng || G0)();
  if (i[6] = i[6] & 15 | 64, i[8] = i[8] & 63 | 128, t) {
    A = A || 0;
    for (let B = 0; B < 16; ++B)
      t[A + B] = i[B];
    return t;
  }
  return F0(i);
}
const b0 = () => {
  const e = rA.join(tA.wrapper.dataPath, "NapCat");
  return nA.mkdirSync(e, { recursive: !0 }), e;
}, N0 = () => {
  const e = rA.join(b0(), "temp");
  return nA.existsSync(e) || nA.mkdirSync(e, { recursive: !0 }), e;
};
function U0(e) {
  const t = Buffer.alloc(4), A = nA.openSync(e, "r");
  return nA.readSync(A, t, 0, 4, 0), nA.closeSync(A), t.toString() === "GIF8";
}
function DQ(e) {
  return new Promise((t, A) => {
    const i = nA.createReadStream(e), B = Co.createHash("md5");
    i.on("data", (g) => {
      B.update(g);
    }), i.on("end", () => {
      const g = B.digest("hex");
      t(g);
    }), i.on("error", (g) => {
      A(g);
    });
  });
}
const v0 = "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", H0 = Buffer.from(v0, "base64");
async function Y0(e) {
  const t = nA.statSync(e).size;
  return new Promise((A, i) => {
    const B = process.env.FFMPEG_PATH;
    B && In.setFfmpegPath(B), In(e).ffprobe((g, n) => {
      if (g)
        i(g);
      else {
        const I = n.streams.find((r) => r.codec_type === "video");
        if (I)
          console.log(`视频尺寸: ${I.width}x${I.height}`);
        else
          return i("未找到视频流信息。");
        A({
          width: I.width,
          height: I.height,
          time: parseInt(I.duration),
          format: n.format.format_name,
          size: t,
          filePath: e
        });
      }
    });
  });
}
var L0 = (() => {
  var e = import.meta.url;
  return async function(t = {}) {
    var A = t, i, B;
    A.ready = new Promise((y, p) => {
      i = y, B = p;
    });
    var g = Object.assign({}, A), n = typeof window == "object", I = typeof importScripts == "function", r = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string", a = "", Q, E, o;
    if (r) {
      let { createRequire: y } = await import("module");
      var c = y(import.meta.url), l = c("fs"), u = c("path");
      I ? a = u.dirname(a) + "/" : a = c("url").fileURLToPath(new URL("data:text/javascript;base64,dmFyIE1vZHVsZT0oKCk9Pnt2YXIgX3NjcmlwdERpcj1pbXBvcnQubWV0YS51cmw7cmV0dXJuIGFzeW5jIGZ1bmN0aW9uKG1vZHVsZUFyZz17fSl7dmFyIGY9bW9kdWxlQXJnLGFhLHI7Zi5yZWFkeT1uZXcgUHJvbWlzZSgoYSxiKT0+e2FhPWEscj1ifSk7dmFyIGJhPU9iamVjdC5hc3NpZ24oe30sZiksY2E9dHlwZW9mIHdpbmRvdz09Im9iamVjdCIsdD10eXBlb2YgaW1wb3J0U2NyaXB0cz09ImZ1bmN0aW9uIixkYT10eXBlb2YgcHJvY2Vzcz09Im9iamVjdCImJnR5cGVvZiBwcm9jZXNzLnZlcnNpb25zPT0ib2JqZWN0IiYmdHlwZW9mIHByb2Nlc3MudmVyc2lvbnMubm9kZT09InN0cmluZyIsdT0iIixlYSx2LEE7aWYoZGEpe2xldHtjcmVhdGVSZXF1aXJlOmF9PWF3YWl0IGltcG9ydCgibW9kdWxlIik7dmFyIHJlcXVpcmUyPWEoaW1wb3J0Lm1ldGEudXJsKSxmcz1yZXF1aXJlMigiZnMiKSxmYT1yZXF1aXJlMigicGF0aCIpO3Q/dT1mYS5kaXJuYW1lKHUpKyIvIjp1PXJlcXVpcmUyKCJ1cmwiKS5maWxlVVJMVG9QYXRoKG5ldyBVUkwoIi4vIixpbXBvcnQubWV0YS51cmwpKSxlYT0oYixjKT0+KGI9QihiKT9uZXcgVVJMKGIpOmZhLm5vcm1hbGl6ZShiKSxmcy5yZWFkRmlsZVN5bmMoYixjP3ZvaWQgMDoidXRmOCIpKSxBPWI9PihiPWVhKGIsITApLGIuYnVmZmVyfHwoYj1uZXcgVWludDhBcnJheShiKSksYiksdj0oYixjLGQsZT0hMCk9PntiPUIoYik/bmV3IFVSTChiKTpmYS5ub3JtYWxpemUoYiksZnMucmVhZEZpbGUoYixlP3ZvaWQgMDoidXRmOCIsKGgsbCk9PntoP2QoaCk6YyhlP2wuYnVmZmVyOmwpfSl9LHByb2Nlc3MuYXJndi5zbGljZSgyKX1lbHNlKGNhfHx0KSYmKHQ/dT1zZWxmLmxvY2F0aW9uLmhyZWY6dHlwZW9mIGRvY3VtZW50PCJ1IiYmZG9jdW1lbnQuY3VycmVudFNjcmlwdCYmKHU9ZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmMpLF9zY3JpcHREaXImJih1PV9zY3JpcHREaXIpLHUuc3RhcnRzV2l0aCgiYmxvYjoiKT91PSIiOnU9dS5zdWJzdHIoMCx1LnJlcGxhY2UoL1s/I10uKi8sIiIpLmxhc3RJbmRleE9mKCIvIikrMSksZWE9YT0+e3ZhciBiPW5ldyBYTUxIdHRwUmVxdWVzdDtyZXR1cm4gYi5vcGVuKCJHRVQiLGEsITEpLGIuc2VuZChudWxsKSxiLnJlc3BvbnNlVGV4dH0sdCYmKEE9YT0+e3ZhciBiPW5ldyBYTUxIdHRwUmVxdWVzdDtyZXR1cm4gYi5vcGVuKCJHRVQiLGEsITEpLGIucmVzcG9uc2VUeXBlPSJhcnJheWJ1ZmZlciIsYi5zZW5kKG51bGwpLG5ldyBVaW50OEFycmF5KGIucmVzcG9uc2UpfSksdj0oYSxiLGMpPT57dmFyIGQ9bmV3IFhNTEh0dHBSZXF1ZXN0O2Qub3BlbigiR0VUIixhLCEwKSxkLnJlc3BvbnNlVHlwZT0iYXJyYXlidWZmZXIiLGQub25sb2FkPSgpPT57ZC5zdGF0dXM9PTIwMHx8ZC5zdGF0dXM9PTAmJmQucmVzcG9uc2U/YihkLnJlc3BvbnNlKTpjKCl9LGQub25lcnJvcj1jLGQuc2VuZChudWxsKX0pO2YucHJpbnR8fGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSk7dmFyIEM9Zi5wcmludEVycnx8Y29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpO09iamVjdC5hc3NpZ24oZixiYSksYmE9bnVsbDt2YXIgRDtmLndhc21CaW5hcnkmJihEPWYud2FzbUJpbmFyeSk7dmFyIEYsaGE9ITEsaWEsRyxILEksSixMLGphLGthO2Z1bmN0aW9uIGxhKCl7dmFyIGE9Ri5idWZmZXI7Zi5IRUFQOD1pYT1uZXcgSW50OEFycmF5KGEpLGYuSEVBUDE2PUg9bmV3IEludDE2QXJyYXkoYSksZi5IRUFQVTg9Rz1uZXcgVWludDhBcnJheShhKSxmLkhFQVBVMTY9ST1uZXcgVWludDE2QXJyYXkoYSksZi5IRUFQMzI9Sj1uZXcgSW50MzJBcnJheShhKSxmLkhFQVBVMzI9TD1uZXcgVWludDMyQXJyYXkoYSksZi5IRUFQRjMyPWphPW5ldyBGbG9hdDMyQXJyYXkoYSksZi5IRUFQRjY0PWthPW5ldyBGbG9hdDY0QXJyYXkoYSl9dmFyIG1hPVtdLG5hPVtdLG9hPVtdO2Z1bmN0aW9uIHFhKCl7dmFyIGE9Zi5wcmVSdW4uc2hpZnQoKTttYS51bnNoaWZ0KGEpfXZhciBNPTAscmE9bnVsbCxOPW51bGw7ZnVuY3Rpb24gc2EoYSl7dGhyb3cgZi5vbkFib3J0Py4oYSksYT0iQWJvcnRlZCgiK2ErIikiLEMoYSksaGE9ITAsYT1uZXcgV2ViQXNzZW1ibHkuUnVudGltZUVycm9yKGErIi4gQnVpbGQgd2l0aCAtc0FTU0VSVElPTlMgZm9yIG1vcmUgaW5mby4iKSxyKGEpLGF9dmFyIHRhPWE9PmEuc3RhcnRzV2l0aCgiZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LCIpLEI9YT0+YS5zdGFydHNXaXRoKCJmaWxlOi8vIiksTztpZihmLmxvY2F0ZUZpbGUpe2lmKE89InNpbGtfd2FzbS53YXNtIiwhdGEoTykpe3ZhciB1YT1PO089Zi5sb2NhdGVGaWxlP2YubG9jYXRlRmlsZSh1YSx1KTp1K3VhfX1lbHNlIE89bmV3IFVSTCgic2lsa193YXNtLndhc20iLGltcG9ydC5tZXRhLnVybCkuaHJlZjtmdW5jdGlvbiB2YShhKXtpZihhPT1PJiZEKXJldHVybiBuZXcgVWludDhBcnJheShEKTtpZihBKXJldHVybiBBKGEpO3Rocm93ImJvdGggYXN5bmMgYW5kIHN5bmMgZmV0Y2hpbmcgb2YgdGhlIHdhc20gZmFpbGVkIn1mdW5jdGlvbiB3YShhKXtpZighRCYmKGNhfHx0KSl7aWYodHlwZW9mIGZldGNoPT0iZnVuY3Rpb24iJiYhQihhKSlyZXR1cm4gZmV0Y2goYSx7Y3JlZGVudGlhbHM6InNhbWUtb3JpZ2luIn0pLnRoZW4oYj0+e2lmKCFiLm9rKXRocm93YGZhaWxlZCB0byBsb2FkIHdhc20gYmluYXJ5IGZpbGUgYXQgJyR7YX0nYDtyZXR1cm4gYi5hcnJheUJ1ZmZlcigpfSkuY2F0Y2goKCk9PnZhKGEpKTtpZih2KXJldHVybiBuZXcgUHJvbWlzZSgoYixjKT0+e3YoYSxkPT5iKG5ldyBVaW50OEFycmF5KGQpKSxjKX0pfXJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpPT52YShhKSl9ZnVuY3Rpb24geGEoYSxiLGMpe3JldHVybiB3YShhKS50aGVuKGQ9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGQsYikpLnRoZW4oYyxkPT57QyhgZmFpbGVkIHRvIGFzeW5jaHJvbm91c2x5IHByZXBhcmUgd2FzbTogJHtkfWApLHNhKGQpfSl9ZnVuY3Rpb24geWEoYSxiKXt2YXIgYz1PO3JldHVybiBEfHx0eXBlb2YgV2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmchPSJmdW5jdGlvbiJ8fHRhKGMpfHxCKGMpfHxkYXx8dHlwZW9mIGZldGNoIT0iZnVuY3Rpb24iP3hhKGMsYSxiKTpmZXRjaChjLHtjcmVkZW50aWFsczoic2FtZS1vcmlnaW4ifSkudGhlbihkPT5XZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhkLGEpLnRoZW4oYixmdW5jdGlvbihlKXtyZXR1cm4gQyhgd2FzbSBzdHJlYW1pbmcgY29tcGlsZSBmYWlsZWQ6ICR7ZX1gKSxDKCJmYWxsaW5nIGJhY2sgdG8gQXJyYXlCdWZmZXIgaW5zdGFudGlhdGlvbiIpLHhhKGMsYSxiKX0pKX12YXIgemE9YT0+e2Zvcig7MDxhLmxlbmd0aDspYS5zaGlmdCgpKGYpfTtjbGFzcyBBYXtjb25zdHJ1Y3RvcihhKXt0aGlzLkM9YS0yNH19dmFyIEJhPTAsQ2E9MCxEYSxQPWE9Pntmb3IodmFyIGI9IiI7R1thXTspYis9RGFbR1thKytdXTtyZXR1cm4gYn0sUT17fSxSPXt9LFM9e30sVCxFYT1hPT57dGhyb3cgbmV3IFQoYSl9LEZhLEdhPShhLGIpPT57ZnVuY3Rpb24gYyhnKXtpZihnPWIoZyksZy5sZW5ndGghPT1kLmxlbmd0aCl0aHJvdyBuZXcgRmEoIk1pc21hdGNoZWQgdHlwZSBjb252ZXJ0ZXIgY291bnQiKTtmb3IodmFyIG09MDttPGQubGVuZ3RoOysrbSlVKGRbbV0sZ1ttXSl9dmFyIGQ9W107ZC5mb3JFYWNoKGZ1bmN0aW9uKGcpe1NbZ109YX0pO3ZhciBlPUFycmF5KGEubGVuZ3RoKSxoPVtdLGw9MDthLmZvckVhY2goKGcsbSk9PntSLmhhc093blByb3BlcnR5KGcpP2VbbV09UltnXTooaC5wdXNoKGcpLFEuaGFzT3duUHJvcGVydHkoZyl8fChRW2ddPVtdKSxRW2ddLnB1c2goKCk9PntlW21dPVJbZ10sKytsLGw9PT1oLmxlbmd0aCYmYyhlKX0pKX0pLGgubGVuZ3RoPT09MCYmYyhlKX07ZnVuY3Rpb24gSGEoYSxiLGM9e30pe3ZhciBkPWIubmFtZTtpZighYSl0aHJvdyBuZXcgVChgdHlwZSAiJHtkfSIgbXVzdCBoYXZlIGEgcG9zaXRpdmUgaW50ZWdlciB0eXBlaWQgcG9pbnRlcmApO2lmKFIuaGFzT3duUHJvcGVydHkoYSkpe2lmKGMuRilyZXR1cm47dGhyb3cgbmV3IFQoYENhbm5vdCByZWdpc3RlciB0eXBlICcke2R9JyB0d2ljZWApfVJbYV09YixkZWxldGUgU1thXSxRLmhhc093blByb3BlcnR5KGEpJiYoYj1RW2FdLGRlbGV0ZSBRW2FdLGIuZm9yRWFjaChlPT5lKCkpKX1mdW5jdGlvbiBVKGEsYixjPXt9KXtpZighKCJhcmdQYWNrQWR2YW5jZSJpbiBiKSl0aHJvdyBuZXcgVHlwZUVycm9yKCJyZWdpc3RlclR5cGUgcmVnaXN0ZXJlZEluc3RhbmNlIHJlcXVpcmVzIGFyZ1BhY2tBZHZhbmNlIik7cmV0dXJuIEhhKGEsYixjKX12YXIgSWE9W10sVj1bXSxKYT1hPT57OTxhJiYtLVZbYSsxXT09PTAmJihWW2FdPXZvaWQgMCxJYS5wdXNoKGEpKX0sS2E9YT0+e2lmKCFhKXRocm93IG5ldyBUKCJDYW5ub3QgdXNlIGRlbGV0ZWQgdmFsLiBoYW5kbGUgPSAiK2EpO3JldHVybiBWW2FdfSxMYT1hPT57c3dpdGNoKGEpe2Nhc2Ugdm9pZCAwOnJldHVybiAyO2Nhc2UgbnVsbDpyZXR1cm4gNDtjYXNlITA6cmV0dXJuIDY7Y2FzZSExOnJldHVybiA4O2RlZmF1bHQ6bGV0IGI9SWEucG9wKCl8fFYubGVuZ3RoO3JldHVybiBWW2JdPWEsVltiKzFdPTEsYn19O2Z1bmN0aW9uIE1hKGEpe3JldHVybiB0aGlzLmZyb21XaXJlVHlwZShMW2E+PjJdKX12YXIgTmE9e25hbWU6ImVtc2NyaXB0ZW46OnZhbCIsZnJvbVdpcmVUeXBlOmE9Pnt2YXIgYj1LYShhKTtyZXR1cm4gSmEoYSksYn0sdG9XaXJlVHlwZTooYSxiKT0+TGEoYiksYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpNYSxCOm51bGx9LE9hPShhLGIpPT57c3dpdGNoKGIpe2Nhc2UgNDpyZXR1cm4gZnVuY3Rpb24oYyl7cmV0dXJuIHRoaXMuZnJvbVdpcmVUeXBlKGphW2M+PjJdKX07Y2FzZSA4OnJldHVybiBmdW5jdGlvbihjKXtyZXR1cm4gdGhpcy5mcm9tV2lyZVR5cGUoa2FbYz4+M10pfTtkZWZhdWx0OnRocm93IG5ldyBUeXBlRXJyb3IoYGludmFsaWQgZmxvYXQgd2lkdGggKCR7Yn0pOiAke2F9YCl9fSxXPShhLGIpPT5PYmplY3QuZGVmaW5lUHJvcGVydHkoYiwibmFtZSIse3ZhbHVlOmF9KSxQYT1hPT57Zm9yKDthLmxlbmd0aDspe3ZhciBiPWEucG9wKCk7YS5wb3AoKShiKX19O2Z1bmN0aW9uIFFhKGEpe2Zvcih2YXIgYj0xO2I8YS5sZW5ndGg7KytiKWlmKGFbYl0hPT1udWxsJiZhW2JdLkI9PT12b2lkIDApcmV0dXJuITA7cmV0dXJuITF9ZnVuY3Rpb24gUmEoYSl7dmFyIGI9RnVuY3Rpb247aWYoIShiIGluc3RhbmNlb2YgRnVuY3Rpb24pKXRocm93IG5ldyBUeXBlRXJyb3IoYG5ld18gY2FsbGVkIHdpdGggY29uc3RydWN0b3IgdHlwZSAke3R5cGVvZiBifSB3aGljaCBpcyBub3QgYSBmdW5jdGlvbmApO3ZhciBjPVcoYi5uYW1lfHwidW5rbm93bkZ1bmN0aW9uTmFtZSIsZnVuY3Rpb24oKXt9KTtyZXR1cm4gYy5wcm90b3R5cGU9Yi5wcm90b3R5cGUsYz1uZXcgYyxhPWIuYXBwbHkoYyxhKSxhIGluc3RhbmNlb2YgT2JqZWN0P2E6Y31mb3IodmFyIFNhPShhLGIpPT57aWYoZlthXS5BPT09dm9pZCAwKXt2YXIgYz1mW2FdO2ZbYV09ZnVuY3Rpb24oLi4uZCl7aWYoIWZbYV0uQS5oYXNPd25Qcm9wZXJ0eShkLmxlbmd0aCkpdGhyb3cgbmV3IFQoYEZ1bmN0aW9uICcke2J9JyBjYWxsZWQgd2l0aCBhbiBpbnZhbGlkIG51bWJlciBvZiBhcmd1bWVudHMgKCR7ZC5sZW5ndGh9KSAtIGV4cGVjdHMgb25lIG9mICgke2ZbYV0uQX0pIWApO3JldHVybiBmW2FdLkFbZC5sZW5ndGhdLmFwcGx5KHRoaXMsZCl9LGZbYV0uQT1bXSxmW2FdLkFbYy5EXT1jfX0sVGE9KGEsYixjKT0+e2lmKGYuaGFzT3duUHJvcGVydHkoYSkpe2lmKGM9PT12b2lkIDB8fGZbYV0uQSE9PXZvaWQgMCYmZlthXS5BW2NdIT09dm9pZCAwKXRocm93IG5ldyBUKGBDYW5ub3QgcmVnaXN0ZXIgcHVibGljIG5hbWUgJyR7YX0nIHR3aWNlYCk7aWYoU2EoYSxhKSxmLmhhc093blByb3BlcnR5KGMpKXRocm93IG5ldyBUKGBDYW5ub3QgcmVnaXN0ZXIgbXVsdGlwbGUgb3ZlcmxvYWRzIG9mIGEgZnVuY3Rpb24gd2l0aCB0aGUgc2FtZSBudW1iZXIgb2YgYXJndW1lbnRzICgke2N9KSFgKTtmW2FdLkFbY109Yn1lbHNlIGZbYV09YixjIT09dm9pZCAwJiYoZlthXS5IPWMpfSxVYT0oYSxiKT0+e2Zvcih2YXIgYz1bXSxkPTA7ZDxhO2QrKyljLnB1c2goTFtiKzQqZD4+Ml0pO3JldHVybiBjfSxYPVtdLFhhLFlhPWE9Pnt2YXIgYj1YW2FdO3JldHVybiBifHwoYT49WC5sZW5ndGgmJihYLmxlbmd0aD1hKzEpLFhbYV09Yj1YYS5nZXQoYSkpLGJ9LFphPShhLGIsYz1bXSk9PmEuaW5jbHVkZXMoImoiKT8oMCxmWyJkeW5DYWxsXyIrYV0pKGIsLi4uYyk6WWEoYikoLi4uYyksJGE9KGEsYik9PiguLi5jKT0+WmEoYSxiLGMpLGFiPShhLGIpPT57YT1QKGEpO3ZhciBjPWEuaW5jbHVkZXMoImoiKT8kYShhLGIpOllhKGIpO2lmKHR5cGVvZiBjIT0iZnVuY3Rpb24iKXRocm93IG5ldyBUKGB1bmtub3duIGZ1bmN0aW9uIHBvaW50ZXIgd2l0aCBzaWduYXR1cmUgJHthfTogJHtifWApO3JldHVybiBjfSxiYixkYj1hPT57YT1jYihhKTt2YXIgYj1QKGEpO3JldHVybiBZKGEpLGJ9LGViPShhLGIpPT57ZnVuY3Rpb24gYyhoKXtlW2hdfHxSW2hdfHwoU1toXT9TW2hdLmZvckVhY2goYyk6KGQucHVzaChoKSxlW2hdPSEwKSl9dmFyIGQ9W10sZT17fTt0aHJvdyBiLmZvckVhY2goYyksbmV3IGJiKGAke2F9OiBgK2QubWFwKGRiKS5qb2luKFsiLCAiXSkpfSxmYj1hPT57YT1hLnRyaW0oKTtsZXQgYj1hLmluZGV4T2YoIigiKTtyZXR1cm4gYiE9PS0xP2Euc3Vic3RyKDAsYik6YX0sZ2I9KGEsYixjKT0+e3N3aXRjaChiKXtjYXNlIDE6cmV0dXJuIGM/ZD0+aWFbZF06ZD0+R1tkXTtjYXNlIDI6cmV0dXJuIGM/ZD0+SFtkPj4xXTpkPT5JW2Q+PjFdO2Nhc2UgNDpyZXR1cm4gYz9kPT5KW2Q+PjJdOmQ9PkxbZD4+Ml07ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKGBpbnZhbGlkIGludGVnZXIgd2lkdGggKCR7Yn0pOiAke2F9YCl9fSxoYj10eXBlb2YgVGV4dERlY29kZXI8InUiP25ldyBUZXh0RGVjb2RlcigidXRmOCIpOnZvaWQgMCxpYj10eXBlb2YgVGV4dERlY29kZXI8InUiP25ldyBUZXh0RGVjb2RlcigidXRmLTE2bGUiKTp2b2lkIDAsamI9KGEsYik9Pntmb3IodmFyIGM9YT4+MSxkPWMrYi8yOyEoYz49ZCkmJklbY107KSsrYztpZihjPDw9MSwzMjxjLWEmJmliKXJldHVybiBpYi5kZWNvZGUoRy5zdWJhcnJheShhLGMpKTtmb3IoYz0iIixkPTA7IShkPj1iLzIpOysrZCl7dmFyIGU9SFthKzIqZD4+MV07aWYoZT09MClicmVhaztjKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGUpfXJldHVybiBjfSxrYj0oYSxiLGMpPT57aWYoYz8/PTIxNDc0ODM2NDcsMj5jKXJldHVybiAwO2MtPTI7dmFyIGQ9YjtjPWM8MiphLmxlbmd0aD9jLzI6YS5sZW5ndGg7Zm9yKHZhciBlPTA7ZTxjOysrZSlIW2I+PjFdPWEuY2hhckNvZGVBdChlKSxiKz0yO3JldHVybiBIW2I+PjFdPTAsYi1kfSxsYj1hPT4yKmEubGVuZ3RoLG1iPShhLGIpPT57Zm9yKHZhciBjPTAsZD0iIjshKGM+PWIvNCk7KXt2YXIgZT1KW2ErNCpjPj4yXTtpZihlPT0wKWJyZWFrOysrYyw2NTUzNjw9ZT8oZS09NjU1MzYsZCs9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxlPj4xMCw1NjMyMHxlJjEwMjMpKTpkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGUpfXJldHVybiBkfSxuYj0oYSxiLGMpPT57aWYoYz8/PTIxNDc0ODM2NDcsND5jKXJldHVybiAwO3ZhciBkPWI7Yz1kK2MtNDtmb3IodmFyIGU9MDtlPGEubGVuZ3RoOysrZSl7dmFyIGg9YS5jaGFyQ29kZUF0KGUpO2lmKDU1Mjk2PD1oJiY1NzM0Mz49aCl7dmFyIGw9YS5jaGFyQ29kZUF0KCsrZSk7aD02NTUzNisoKGgmMTAyMyk8PDEwKXxsJjEwMjN9aWYoSltiPj4yXT1oLGIrPTQsYis0PmMpYnJlYWt9cmV0dXJuIEpbYj4+Ml09MCxiLWR9LG9iPWE9Pntmb3IodmFyIGI9MCxjPTA7YzxhLmxlbmd0aDsrK2Mpe3ZhciBkPWEuY2hhckNvZGVBdChjKTs1NTI5Njw9ZCYmNTczNDM+PWQmJisrYyxiKz00fXJldHVybiBifSxwYj1bXSxxYj1hPT57dmFyIGI9cGIubGVuZ3RoO3JldHVybiBwYi5wdXNoKGEpLGJ9LHJiPShhLGIpPT57dmFyIGM9UlthXTtpZihjPT09dm9pZCAwKXRocm93IGE9YCR7Yn0gaGFzIHVua25vd24gdHlwZSAke2RiKGEpfWAsbmV3IFQoYSk7cmV0dXJuIGN9LHNiPShhLGIpPT57Zm9yKHZhciBjPUFycmF5KGEpLGQ9MDtkPGE7KytkKWNbZF09cmIoTFtiKzQqZD4+Ml0sInBhcmFtZXRlciAiK2QpO3JldHVybiBjfSx0Yj0oYSxiLGMpPT57dmFyIGQ9W107cmV0dXJuIGE9YS50b1dpcmVUeXBlKGQsYyksZC5sZW5ndGgmJihMW2I+PjJdPUxhKGQpKSxhfSx1Yj1BcnJheSgyNTYpLHZiPTA7MjU2PnZiOysrdmIpdWJbdmJdPVN0cmluZy5mcm9tQ2hhckNvZGUodmIpO0RhPXViLFQ9Zi5CaW5kaW5nRXJyb3I9Y2xhc3MgZXh0ZW5kcyBFcnJvcntjb25zdHJ1Y3RvcihhKXtzdXBlcihhKSx0aGlzLm5hbWU9IkJpbmRpbmdFcnJvciJ9fSxGYT1mLkludGVybmFsRXJyb3I9Y2xhc3MgZXh0ZW5kcyBFcnJvcntjb25zdHJ1Y3RvcihhKXtzdXBlcihhKSx0aGlzLm5hbWU9IkludGVybmFsRXJyb3IifX0sVi5wdXNoKDAsMSx2b2lkIDAsMSxudWxsLDEsITAsMSwhMSwxKSxmLmNvdW50X2VtdmFsX2hhbmRsZXM9KCk9PlYubGVuZ3RoLzItNS1JYS5sZW5ndGgsYmI9Zi5VbmJvdW5kVHlwZUVycm9yPSgoYSxiKT0+e3ZhciBjPVcoYixmdW5jdGlvbihkKXt0aGlzLm5hbWU9Yix0aGlzLm1lc3NhZ2U9ZCxkPUVycm9yKGQpLnN0YWNrLGQhPT12b2lkIDAmJih0aGlzLnN0YWNrPXRoaXMudG9TdHJpbmcoKStgCmArZC5yZXBsYWNlKC9eRXJyb3IoOlteXG5dKik/XG4vLCIiKSl9KTtyZXR1cm4gYy5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShhLnByb3RvdHlwZSksYy5wcm90b3R5cGUuY29uc3RydWN0b3I9YyxjLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVybiB0aGlzLm1lc3NhZ2U9PT12b2lkIDA/dGhpcy5uYW1lOmAke3RoaXMubmFtZX06ICR7dGhpcy5tZXNzYWdlfWB9LGN9KShFcnJvciwiVW5ib3VuZFR5cGVFcnJvciIpO3ZhciB4Yj17azooYSxiLGMpPT57dmFyIGQ9bmV3IEFhKGEpO3Rocm93IExbZC5DKzE2Pj4yXT0wLExbZC5DKzQ+PjJdPWIsTFtkLkMrOD4+Ml09YyxCYT1hLENhKyssQmF9LG86KCk9Pnt9LGk6KGEsYixjLGQpPT57Yj1QKGIpLFUoYSx7bmFtZTpiLGZyb21XaXJlVHlwZTpmdW5jdGlvbihlKXtyZXR1cm4hIWV9LHRvV2lyZVR5cGU6ZnVuY3Rpb24oZSxoKXtyZXR1cm4gaD9jOmR9LGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuZnJvbVdpcmVUeXBlKEdbZV0pfSxCOm51bGx9KX0sczphPT5VKGEsTmEpLGg6KGEsYixjKT0+e2I9UChiKSxVKGEse25hbWU6Yixmcm9tV2lyZVR5cGU6ZD0+ZCx0b1dpcmVUeXBlOihkLGUpPT5lLGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6T2EoYixjKSxCOm51bGx9KX0sZDooYSxiLGMsZCxlLGgsbCk9Pnt2YXIgZz1VYShiLGMpO2E9UChhKSxhPWZiKGEpLGU9YWIoZCxlKSxUYShhLGZ1bmN0aW9uKCl7ZWIoYENhbm5vdCBjYWxsICR7YX0gZHVlIHRvIHVuYm91bmQgdHlwZXNgLGcpfSxiLTEpLEdhKGcsbT0+e3ZhciBrPVttWzBdLG51bGxdLmNvbmNhdChtLnNsaWNlKDEpKTttPWE7dmFyIG49YSxxPWUscD1rLmxlbmd0aDtpZigyPnApdGhyb3cgbmV3IFQoImFyZ1R5cGVzIGFycmF5IHNpemUgbWlzbWF0Y2ghIE11c3QgYXQgbGVhc3QgZ2V0IHJldHVybiB2YWx1ZSBhbmQgJ3RoaXMnIHR5cGVzISIpO3ZhciB4PWtbMV0hPT1udWxsJiYhMSxFPVFhKGspLHk9a1swXS5uYW1lIT09InZvaWQiO3E9W24sRWEscSxoLFBhLGtbMF0sa1sxXV07Zm9yKHZhciB3PTA7dzxwLTI7Kyt3KXEucHVzaChrW3crMl0pO2lmKCFFKWZvcih3PXg/MToyO3c8ay5sZW5ndGg7Kyt3KWtbd10uQiE9PW51bGwmJnEucHVzaChrW3ddLkIpO0U9UWEoayksdz1rLmxlbmd0aDt2YXIgej0iIixLPSIiO2ZvcihwPTA7cDx3LTI7KytwKXorPShwIT09MD8iLCAiOiIiKSsiYXJnIitwLEsrPShwIT09MD8iLCAiOiIiKSsiYXJnIitwKyJXaXJlZCI7ej1gCiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgke3p9KSB7CiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggIT09ICR7dy0yfSkgewogICAgICAgICAgdGhyb3dCaW5kaW5nRXJyb3IoJ2Z1bmN0aW9uICcgKyBodW1hbk5hbWUgKyAnIGNhbGxlZCB3aXRoICcgKyBhcmd1bWVudHMubGVuZ3RoICsgJyBhcmd1bWVudHMsIGV4cGVjdGVkICR7dy0yfScpOwogICAgICAgIH1gLEUmJih6Kz1gdmFyIGRlc3RydWN0b3JzID0gW107CmApO3ZhciBWYT1FPyJkZXN0cnVjdG9ycyI6Im51bGwiLHBhPSJodW1hbk5hbWUgdGhyb3dCaW5kaW5nRXJyb3IgaW52b2tlciBmbiBydW5EZXN0cnVjdG9ycyByZXRUeXBlIGNsYXNzUGFyYW0iLnNwbGl0KCIgIik7Zm9yKHgmJih6Kz0idmFyIHRoaXNXaXJlZCA9IGNsYXNzUGFyYW1bJ3RvV2lyZVR5cGUnXSgiK1ZhK2AsIHRoaXMpOwpgKSxwPTA7cDx3LTI7KytwKXorPSJ2YXIgYXJnIitwKyJXaXJlZCA9IGFyZ1R5cGUiK3ArIlsndG9XaXJlVHlwZSddKCIrVmErIiwgYXJnIitwK2ApOwpgLHBhLnB1c2goImFyZ1R5cGUiK3ApO2lmKHgmJihLPSJ0aGlzV2lyZWQiKygwPEsubGVuZ3RoPyIsICI6IiIpK0spLHorPSh5fHxsPyJ2YXIgcnYgPSAiOiIiKSsiaW52b2tlcihmbiIrKDA8Sy5sZW5ndGg/IiwgIjoiIikrSytgKTsKYCxFKXorPWBydW5EZXN0cnVjdG9ycyhkZXN0cnVjdG9ycyk7CmA7ZWxzZSBmb3IocD14PzE6MjtwPGsubGVuZ3RoOysrcCl4PXA9PT0xPyJ0aGlzV2lyZWQiOiJhcmciKyhwLTIpKyJXaXJlZCIsa1twXS5CIT09bnVsbCYmKHorPWAke3h9X2R0b3IoJHt4fSk7CmAscGEucHVzaChgJHt4fV9kdG9yYCkpO3kmJih6Kz1gdmFyIHJldCA9IHJldFR5cGVbJ2Zyb21XaXJlVHlwZSddKHJ2KTsKcmV0dXJuIHJldDsKYCk7bGV0W1dhLHpiXT1bcGEseitgfQpgXTtpZihXYS5wdXNoKHpiKSxrPVJhKFdhKSguLi5xKSxuPVcobixrKSxrPWItMSwhZi5oYXNPd25Qcm9wZXJ0eShtKSl0aHJvdyBuZXcgRmEoIlJlcGxhY2luZyBub25leGlzdGVudCBwdWJsaWMgc3ltYm9sIik7cmV0dXJuIGZbbV0uQSE9PXZvaWQgMCYmayE9PXZvaWQgMD9mW21dLkFba109bjooZlttXT1uLGZbbV0uRD1rKSxbXX0pfSxiOihhLGIsYyxkLGUpPT57aWYoYj1QKGIpLGU9PT0tMSYmKGU9NDI5NDk2NzI5NSksZT1nPT5nLGQ9PT0wKXt2YXIgaD0zMi04KmM7ZT1nPT5nPDxoPj4+aH12YXIgbD1iLmluY2x1ZGVzKCJ1bnNpZ25lZCIpP2Z1bmN0aW9uKGcsbSl7cmV0dXJuIG0+Pj4wfTpmdW5jdGlvbihnLG0pe3JldHVybiBtfTtVKGEse25hbWU6Yixmcm9tV2lyZVR5cGU6ZSx0b1dpcmVUeXBlOmwsYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpnYihiLGMsZCE9PTApLEI6bnVsbH0pfSxhOihhLGIsYyk9PntmdW5jdGlvbiBkKGgpe3JldHVybiBuZXcgZShpYS5idWZmZXIsTFtoKzQ+PjJdLExbaD4+Ml0pfXZhciBlPVtJbnQ4QXJyYXksVWludDhBcnJheSxJbnQxNkFycmF5LFVpbnQxNkFycmF5LEludDMyQXJyYXksVWludDMyQXJyYXksRmxvYXQzMkFycmF5LEZsb2F0NjRBcnJheV1bYl07Yz1QKGMpLFUoYSx7bmFtZTpjLGZyb21XaXJlVHlwZTpkLGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6ZH0se0Y6ITB9KX0sZzooYSxiKT0+e2I9UChiKTt2YXIgYz1iPT09InN0ZDo6c3RyaW5nIjtVKGEse25hbWU6Yixmcm9tV2lyZVR5cGU6ZnVuY3Rpb24oZCl7dmFyIGU9TFtkPj4yXSxoPWQrNDtpZihjKWZvcih2YXIgbD1oLGc9MDtnPD1lOysrZyl7dmFyIG09aCtnO2lmKGc9PWV8fEdbbV09PTApe2lmKGwpe3ZhciBrPWwsbj1HLHE9aysobS1sKTtmb3IobD1rO25bbF0mJiEobD49cSk7KSsrbDtpZigxNjxsLWsmJm4uYnVmZmVyJiZoYilrPWhiLmRlY29kZShuLnN1YmFycmF5KGssbCkpO2Vsc2V7Zm9yKHE9IiI7azxsOyl7dmFyIHA9bltrKytdO2lmKHAmMTI4KXt2YXIgeD1uW2srK10mNjM7aWYoKHAmMjI0KT09MTkyKXErPVN0cmluZy5mcm9tQ2hhckNvZGUoKHAmMzEpPDw2fHgpO2Vsc2V7dmFyIEU9bltrKytdJjYzO3A9KHAmMjQwKT09MjI0PyhwJjE1KTw8MTJ8eDw8NnxFOihwJjcpPDwxOHx4PDwxMnxFPDw2fG5baysrXSY2Myw2NTUzNj5wP3ErPVN0cmluZy5mcm9tQ2hhckNvZGUocCk6KHAtPTY1NTM2LHErPVN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTZ8cD4+MTAsNTYzMjB8cCYxMDIzKSl9fWVsc2UgcSs9U3RyaW5nLmZyb21DaGFyQ29kZShwKX1rPXF9fWVsc2Ugaz0iIjtpZih5PT09dm9pZCAwKXZhciB5PWs7ZWxzZSB5Kz0iXDAiLHkrPWs7bD1tKzF9fWVsc2V7Zm9yKHk9QXJyYXkoZSksZz0wO2c8ZTsrK2cpeVtnXT1TdHJpbmcuZnJvbUNoYXJDb2RlKEdbaCtnXSk7eT15LmpvaW4oIiIpfXJldHVybiBZKGQpLHl9LHRvV2lyZVR5cGU6ZnVuY3Rpb24oZCxlKXtlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXImJihlPW5ldyBVaW50OEFycmF5KGUpKTt2YXIgaCxsPXR5cGVvZiBlPT0ic3RyaW5nIjtpZighKGx8fGUgaW5zdGFuY2VvZiBVaW50OEFycmF5fHxlIGluc3RhbmNlb2YgVWludDhDbGFtcGVkQXJyYXl8fGUgaW5zdGFuY2VvZiBJbnQ4QXJyYXkpKXRocm93IG5ldyBUKCJDYW5ub3QgcGFzcyBub24tc3RyaW5nIHRvIHN0ZDo6c3RyaW5nIik7dmFyIGc7aWYoYyYmbClmb3IoaD1nPTA7aDxlLmxlbmd0aDsrK2gpe3ZhciBtPWUuY2hhckNvZGVBdChoKTsxMjc+PW0/ZysrOjIwNDc+PW0/Zys9Mjo1NTI5Njw9bSYmNTczNDM+PW0/KGcrPTQsKytoKTpnKz0zfWVsc2UgZz1lLmxlbmd0aDtpZihoPWcsZz13Yig0K2grMSksbT1nKzQsTFtnPj4yXT1oLGMmJmwpe2lmKGw9bSxtPWgrMSxoPUcsMDxtKXttPWwrbS0xO2Zvcih2YXIgaz0wO2s8ZS5sZW5ndGg7KytrKXt2YXIgbj1lLmNoYXJDb2RlQXQoayk7aWYoNTUyOTY8PW4mJjU3MzQzPj1uKXt2YXIgcT1lLmNoYXJDb2RlQXQoKytrKTtuPTY1NTM2KygobiYxMDIzKTw8MTApfHEmMTAyM31pZigxMjc+PW4pe2lmKGw+PW0pYnJlYWs7aFtsKytdPW59ZWxzZXtpZigyMDQ3Pj1uKXtpZihsKzE+PW0pYnJlYWs7aFtsKytdPTE5MnxuPj42fWVsc2V7aWYoNjU1MzU+PW4pe2lmKGwrMj49bSlicmVhaztoW2wrK109MjI0fG4+PjEyfWVsc2V7aWYobCszPj1tKWJyZWFrO2hbbCsrXT0yNDB8bj4+MTgsaFtsKytdPTEyOHxuPj4xMiY2M31oW2wrK109MTI4fG4+PjYmNjN9aFtsKytdPTEyOHxuJjYzfX1oW2xdPTB9fWVsc2UgaWYobClmb3IobD0wO2w8aDsrK2wpe2lmKGs9ZS5jaGFyQ29kZUF0KGwpLDI1NTxrKXRocm93IFkobSksbmV3IFQoIlN0cmluZyBoYXMgVVRGLTE2IGNvZGUgdW5pdHMgdGhhdCBkbyBub3QgZml0IGluIDggYml0cyIpO0dbbStsXT1rfWVsc2UgZm9yKGw9MDtsPGg7KytsKUdbbStsXT1lW2xdO3JldHVybiBkIT09bnVsbCYmZC5wdXNoKFksZyksZ30sYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpNYSxCKGQpe1koZCl9fSl9LGU6KGEsYixjKT0+e2lmKGM9UChjKSxiPT09Mil2YXIgZD1qYixlPWtiLGg9bGIsbD1nPT5JW2c+PjFdO2Vsc2UgYj09PTQmJihkPW1iLGU9bmIsaD1vYixsPWc9PkxbZz4+Ml0pO1UoYSx7bmFtZTpjLGZyb21XaXJlVHlwZTpnPT57Zm9yKHZhciBtPUxbZz4+Ml0sayxuPWcrNCxxPTA7cTw9bTsrK3Epe3ZhciBwPWcrNCtxKmI7KHE9PW18fGwocCk9PTApJiYobj1kKG4scC1uKSxrPT09dm9pZCAwP2s9bjooays9IlwwIixrKz1uKSxuPXArYil9cmV0dXJuIFkoZyksa30sdG9XaXJlVHlwZTooZyxtKT0+e2lmKHR5cGVvZiBtIT0ic3RyaW5nIil0aHJvdyBuZXcgVChgQ2Fubm90IHBhc3Mgbm9uLXN0cmluZyB0byBDKysgc3RyaW5nIHR5cGUgJHtjfWApO3ZhciBrPWgobSksbj13Yig0K2srYik7cmV0dXJuIExbbj4+Ml09ay9iLGUobSxuKzQsaytiKSxnIT09bnVsbCYmZy5wdXNoKFksbiksbn0sYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpNYSxCKGcpe1koZyl9fSl9LGo6KGEsYik9PntiPVAoYiksVShhLHtHOiEwLG5hbWU6YixhcmdQYWNrQWR2YW5jZTowLGZyb21XaXJlVHlwZTooKT0+e30sdG9XaXJlVHlwZTooKT0+e319KX0sbTooYSxiLGMsZCk9PihhPXBiW2FdLGI9S2EoYiksYShudWxsLGIsYyxkKSksYzpKYSxuOihhLGIsYyk9PntiPXNiKGEsYik7dmFyIGQ9Yi5zaGlmdCgpO2EtLTt2YXIgZT1gcmV0dXJuIGZ1bmN0aW9uIChvYmosIGZ1bmMsIGRlc3RydWN0b3JzUmVmLCBhcmdzKSB7CmAsaD0wLGw9W107Yz09PTAmJmwucHVzaCgib2JqIik7Zm9yKHZhciBnPVsicmV0VHlwZSJdLG09W2RdLGs9MDtrPGE7KytrKWwucHVzaCgiYXJnIitrKSxnLnB1c2goImFyZ1R5cGUiK2spLG0ucHVzaChiW2tdKSxlKz1gICB2YXIgYXJnJHtrfSA9IGFyZ1R5cGUke2t9LnJlYWRWYWx1ZUZyb21Qb2ludGVyKGFyZ3Mke2g/IisiK2g6IiJ9KTsKYCxoKz1iW2tdLmFyZ1BhY2tBZHZhbmNlO3JldHVybiBlKz1gICB2YXIgcnYgPSAke2M9PT0xPyJuZXcgZnVuYyI6ImZ1bmMuY2FsbCJ9KCR7bC5qb2luKCIsICIpfSk7CmAsZC5HfHwoZy5wdXNoKCJlbXZhbF9yZXR1cm5WYWx1ZSIpLG0ucHVzaCh0YiksZSs9YCAgcmV0dXJuIGVtdmFsX3JldHVyblZhbHVlKHJldFR5cGUsIGRlc3RydWN0b3JzUmVmLCBydik7CmApLGcucHVzaChlK2B9OwpgKSxhPVJhKGcpKC4uLm0pLGM9YG1ldGhvZENhbGxlcjwoJHtiLm1hcChuPT5uLm5hbWUpLmpvaW4oIiwgIil9KSA9PiAke2QubmFtZX0+YCxxYihXKGMsYSkpfSxmOmE9Pns5PGEmJihWW2ErMV0rPTEpfSxsOmE9Pnt2YXIgYj1LYShhKTtQYShiKSxKYShhKX0sdDooYSxiKT0+KGE9cmIoYSwiX2VtdmFsX3Rha2VfdmFsdWUiKSxhPWEucmVhZFZhbHVlRnJvbVBvaW50ZXIoYiksTGEoYSkpLHA6KCk9PntzYSgiIil9LHI6KGEsYixjKT0+Ry5jb3B5V2l0aGluKGEsYixiK2MpLHE6YT0+e3ZhciBiPUcubGVuZ3RoO2lmKGE+Pj49MCwyMTQ3NDgzNjQ4PGEpcmV0dXJuITE7Zm9yKHZhciBjPTE7ND49YztjKj0yKXt2YXIgZD1iKigxKy4yL2MpO2Q9TWF0aC5taW4oZCxhKzEwMDY2MzI5Nik7dmFyIGU9TWF0aDtkPU1hdGgubWF4KGEsZCk7YTp7ZT0oZS5taW4uY2FsbChlLDIxNDc0ODM2NDgsZCsoNjU1MzYtZCU2NTUzNiklNjU1MzYpLUYuYnVmZmVyLmJ5dGVMZW5ndGgrNjU1MzUpLzY1NTM2O3RyeXtGLmdyb3coZSksbGEoKTt2YXIgaD0xO2JyZWFrIGF9Y2F0Y2h7fWg9dm9pZCAwfWlmKGgpcmV0dXJuITB9cmV0dXJuITF9fSxaPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShjKXtyZXR1cm4gWj1jLmV4cG9ydHMsRj1aLnUsbGEoKSxYYT1aLncsbmEudW5zaGlmdChaLnYpLE0tLSxmLm1vbml0b3JSdW5EZXBlbmRlbmNpZXM/LihNKSxNPT0wJiYocmEhPT1udWxsJiYoY2xlYXJJbnRlcnZhbChyYSkscmE9bnVsbCksTiYmKGM9TixOPW51bGwsYygpKSksWn12YXIgYj17YTp4Yn07aWYoTSsrLGYubW9uaXRvclJ1bkRlcGVuZGVuY2llcz8uKE0pLGYuaW5zdGFudGlhdGVXYXNtKXRyeXtyZXR1cm4gZi5pbnN0YW50aWF0ZVdhc20oYixhKX1jYXRjaChjKXtDKGBNb2R1bGUuaW5zdGFudGlhdGVXYXNtIGNhbGxiYWNrIGZhaWxlZCB3aXRoIGVycm9yOiAke2N9YCkscihjKX1yZXR1cm4geWEoYixmdW5jdGlvbihjKXthKGMuaW5zdGFuY2UpfSkuY2F0Y2gocikse319KCksd2I9YT0+KHdiPVoueCkoYSksWT1hPT4oWT1aLnkpKGEpLGNiPWE9PihjYj1aLnopKGEpLHliO049ZnVuY3Rpb24gQWIoKXt5Ynx8QmIoKSx5Ynx8KE49QWIpfTtmdW5jdGlvbiBCYigpe2Z1bmN0aW9uIGEoKXtpZigheWImJih5Yj0hMCxmLmNhbGxlZFJ1bj0hMCwhaGEpKXtpZih6YShuYSksYWEoZiksZi5vblJ1bnRpbWVJbml0aWFsaXplZCYmZi5vblJ1bnRpbWVJbml0aWFsaXplZCgpLGYucG9zdFJ1bilmb3IodHlwZW9mIGYucG9zdFJ1bj09ImZ1bmN0aW9uIiYmKGYucG9zdFJ1bj1bZi5wb3N0UnVuXSk7Zi5wb3N0UnVuLmxlbmd0aDspe3ZhciBiPWYucG9zdFJ1bi5zaGlmdCgpO29hLnVuc2hpZnQoYil9emEob2EpfX1pZighKDA8TSkpe2lmKGYucHJlUnVuKWZvcih0eXBlb2YgZi5wcmVSdW49PSJmdW5jdGlvbiImJihmLnByZVJ1bj1bZi5wcmVSdW5dKTtmLnByZVJ1bi5sZW5ndGg7KXFhKCk7emEobWEpLDA8TXx8KGYuc2V0U3RhdHVzPyhmLnNldFN0YXR1cygiUnVubmluZy4uLiIpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7Zi5zZXRTdGF0dXMoIiIpfSwxKSxhKCl9LDEpKTphKCkpfX1pZihmLnByZUluaXQpZm9yKHR5cGVvZiBmLnByZUluaXQ9PSJmdW5jdGlvbiImJihmLnByZUluaXQ9W2YucHJlSW5pdF0pOzA8Zi5wcmVJbml0Lmxlbmd0aDspZi5wcmVJbml0LnBvcCgpKCk7cmV0dXJuIEJiKCksbW9kdWxlQXJnLnJlYWR5fX0pKCksc2lsa193YXNtX2RlZmF1bHQ9TW9kdWxlO2Z1bmN0aW9uIGlzV2F2RmlsZShmaWxlRGF0YSl7dHJ5e2xldCBjaHVua3M9dW5wYWNrV2F2RmlsZUNodW5rcyhmaWxlRGF0YSksZm10PWRlY29kZUZvcm1hdENodW5rKGNodW5rcy5nZXQoImZtdCIpKSxkYXRhPWNodW5rcy5nZXQoImRhdGEiKTtyZXR1cm4gZ2V0V2F2RmlsZVR5cGUoZm10KSx2ZXJpZnlEYXRhQ2h1bmtMZW5ndGgoZGF0YSxmbXQpLCEwfWNhdGNoe3JldHVybiExfX12YXIgYXVkaW9FbmNvZGluZ05hbWVzPVsiaW50IiwiZmxvYXQiXSx3YXZGaWxlVHlwZUF1ZGlvRW5jb2RpbmdzPVswLDAsMCwxXTtmdW5jdGlvbiBkZWNvZGVXYXZGaWxlKGZpbGVEYXRhKXtsZXQgY2h1bmtzPXVucGFja1dhdkZpbGVDaHVua3MoZmlsZURhdGEpLGZtdD1kZWNvZGVGb3JtYXRDaHVuayhjaHVua3MuZ2V0KCJmbXQiKSksZGF0YT1jaHVua3MuZ2V0KCJkYXRhIiksd2F2RmlsZVR5cGU9Z2V0V2F2RmlsZVR5cGUoZm10KSxhdWRpb0VuY29kaW5nPXdhdkZpbGVUeXBlQXVkaW9FbmNvZGluZ3Nbd2F2RmlsZVR5cGVdLHdhdkZpbGVUeXBlTmFtZT1hdWRpb0VuY29kaW5nTmFtZXNbYXVkaW9FbmNvZGluZ10rZm10LmJpdHNQZXJTYW1wbGU7cmV0dXJuIHZlcmlmeURhdGFDaHVua0xlbmd0aChkYXRhLGZtdCkse2NoYW5uZWxEYXRhOmRlY29kZURhdGFDaHVuayhkYXRhLGZtdCx3YXZGaWxlVHlwZSksc2FtcGxlUmF0ZTpmbXQuc2FtcGxlUmF0ZSxudW1iZXJPZkNoYW5uZWxzOmZtdC5udW1iZXJPZkNoYW5uZWxzLGF1ZGlvRW5jb2RpbmcsYml0c1BlclNhbXBsZTpmbXQuYml0c1BlclNhbXBsZSx3YXZGaWxlVHlwZU5hbWV9fWZ1bmN0aW9uIHVucGFja1dhdkZpbGVDaHVua3MoZmlsZURhdGEpe2xldCBkYXRhVmlldztmaWxlRGF0YSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyP2RhdGFWaWV3PW5ldyBEYXRhVmlldyhmaWxlRGF0YSk6ZGF0YVZpZXc9bmV3IERhdGFWaWV3KGZpbGVEYXRhLmJ1ZmZlcixmaWxlRGF0YS5ieXRlT2Zmc2V0LGZpbGVEYXRhLmJ5dGVMZW5ndGgpO2xldCBmaWxlTGVuZ3RoPWRhdGFWaWV3LmJ5dGVMZW5ndGg7aWYoZmlsZUxlbmd0aDwyMCl0aHJvdyBuZXcgRXJyb3IoIldBViBmaWxlIGlzIHRvbyBzaG9ydC4iKTtpZihnZXRTdHJpbmcoZGF0YVZpZXcsMCw0KSE9IlJJRkYiKXRocm93IG5ldyBFcnJvcigiTm90IGEgdmFsaWQgV0FWIGZpbGUgKG5vIFJJRkYgaGVhZGVyKS4iKTtsZXQgbWFpbkNodW5rTGVuZ3RoPWRhdGFWaWV3LmdldFVpbnQzMig0LCEwKTtpZig4K21haW5DaHVua0xlbmd0aCE9ZmlsZUxlbmd0aCl0aHJvdyBuZXcgRXJyb3IoYE1haW4gY2h1bmsgbGVuZ3RoIG9mIFdBViBmaWxlICgkezgrbWFpbkNodW5rTGVuZ3RofSkgZG9lcyBub3QgbWF0Y2ggZmlsZSBzaXplICgke2ZpbGVMZW5ndGh9KS5gKTtpZihnZXRTdHJpbmcoZGF0YVZpZXcsOCw0KSE9IldBVkUiKXRocm93IG5ldyBFcnJvcigiUklGRiBmaWxlIGlzIG5vdCBhIFdBViBmaWxlLiIpO2xldCBjaHVua3M9bmV3IE1hcCxmaWxlT2Zmc2V0PTEyO2Zvcig7ZmlsZU9mZnNldDxmaWxlTGVuZ3RoOyl7aWYoZmlsZU9mZnNldCs4PmZpbGVMZW5ndGgpdGhyb3cgbmV3IEVycm9yKGBJbmNvbXBsZXRlIGNodW5rIHByZWZpeCBpbiBXQVYgZmlsZSBhdCBvZmZzZXQgJHtmaWxlT2Zmc2V0fS5gKTtsZXQgY2h1bmtJZD1nZXRTdHJpbmcoZGF0YVZpZXcsZmlsZU9mZnNldCw0KS50cmltKCksY2h1bmtMZW5ndGg9ZGF0YVZpZXcuZ2V0VWludDMyKGZpbGVPZmZzZXQrNCwhMCk7aWYoZmlsZU9mZnNldCs4K2NodW5rTGVuZ3RoPmZpbGVMZW5ndGgpdGhyb3cgbmV3IEVycm9yKGBJbmNvbXBsZXRlIGNodW5rIGRhdGEgaW4gV0FWIGZpbGUgYXQgb2Zmc2V0ICR7ZmlsZU9mZnNldH0uYCk7bGV0IGNodW5rRGF0YT1uZXcgRGF0YVZpZXcoZGF0YVZpZXcuYnVmZmVyLGRhdGFWaWV3LmJ5dGVPZmZzZXQrZmlsZU9mZnNldCs4LGNodW5rTGVuZ3RoKTtjaHVua3Muc2V0KGNodW5rSWQsY2h1bmtEYXRhKTtsZXQgcGFkTGVuZ3RoPWNodW5rTGVuZ3RoJTI7ZmlsZU9mZnNldCs9OCtjaHVua0xlbmd0aCtwYWRMZW5ndGh9cmV0dXJuIGNodW5rc31mdW5jdGlvbiBnZXRTdHJpbmcoZGF0YVZpZXcsb2Zmc2V0LGxlbmd0aCl7bGV0IGE9bmV3IFVpbnQ4QXJyYXkoZGF0YVZpZXcuYnVmZmVyLGRhdGFWaWV3LmJ5dGVPZmZzZXQrb2Zmc2V0LGxlbmd0aCk7cmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCxhKX1mdW5jdGlvbiBnZXRJbnQyNChkYXRhVmlldyxvZmZzZXQpe2xldCBiMD1kYXRhVmlldy5nZXRJbnQ4KG9mZnNldCsyKSo2NTUzNixiMTI9ZGF0YVZpZXcuZ2V0VWludDE2KG9mZnNldCwhMCk7cmV0dXJuIGIwK2IxMn1mdW5jdGlvbiBkZWNvZGVGb3JtYXRDaHVuayhkYXRhVmlldyl7aWYoIWRhdGFWaWV3KXRocm93IG5ldyBFcnJvcigiTm8gZm9ybWF0IGNodW5rIGZvdW5kIGluIFdBViBmaWxlLiIpO2lmKGRhdGFWaWV3LmJ5dGVMZW5ndGg8MTYpdGhyb3cgbmV3IEVycm9yKCJGb3JtYXQgY2h1bmsgb2YgV0FWIGZpbGUgaXMgdG9vIHNob3J0LiIpO2xldCBmbXQ9e307cmV0dXJuIGZtdC5mb3JtYXRDb2RlPWRhdGFWaWV3LmdldFVpbnQxNigwLCEwKSxmbXQubnVtYmVyT2ZDaGFubmVscz1kYXRhVmlldy5nZXRVaW50MTYoMiwhMCksZm10LnNhbXBsZVJhdGU9ZGF0YVZpZXcuZ2V0VWludDMyKDQsITApLGZtdC5ieXRlc1BlclNlYz1kYXRhVmlldy5nZXRVaW50MzIoOCwhMCksZm10LmJ5dGVzUGVyRnJhbWU9ZGF0YVZpZXcuZ2V0VWludDE2KDEyLCEwKSxmbXQuYml0c1BlclNhbXBsZT1kYXRhVmlldy5nZXRVaW50MTYoMTQsITApLGZtdH1mdW5jdGlvbiBnZXRXYXZGaWxlVHlwZShmbXQpe2lmKGZtdC5udW1iZXJPZkNoYW5uZWxzPDF8fGZtdC5udW1iZXJPZkNoYW5uZWxzPjk5OSl0aHJvdyBuZXcgRXJyb3IoIkludmFsaWQgbnVtYmVyIG9mIGNoYW5uZWxzIGluIFdBViBmaWxlLiIpO2xldCBieXRlc1BlclNhbXBsZT1NYXRoLmNlaWwoZm10LmJpdHNQZXJTYW1wbGUvOCksZXhwZWN0ZWRCeXRlc1BlckZyYW1lPWZtdC5udW1iZXJPZkNoYW5uZWxzKmJ5dGVzUGVyU2FtcGxlO2lmKGZtdC5mb3JtYXRDb2RlPT0xJiZmbXQuYml0c1BlclNhbXBsZT49MSYmZm10LmJpdHNQZXJTYW1wbGU8PTgmJmZtdC5ieXRlc1BlckZyYW1lPT1leHBlY3RlZEJ5dGVzUGVyRnJhbWUpcmV0dXJuIDA7aWYoZm10LmZvcm1hdENvZGU9PTEmJmZtdC5iaXRzUGVyU2FtcGxlPj05JiZmbXQuYml0c1BlclNhbXBsZTw9MTYmJmZtdC5ieXRlc1BlckZyYW1lPT1leHBlY3RlZEJ5dGVzUGVyRnJhbWUpcmV0dXJuIDE7aWYoZm10LmZvcm1hdENvZGU9PTEmJmZtdC5iaXRzUGVyU2FtcGxlPj0xNyYmZm10LmJpdHNQZXJTYW1wbGU8PTI0JiZmbXQuYnl0ZXNQZXJGcmFtZT09ZXhwZWN0ZWRCeXRlc1BlckZyYW1lKXJldHVybiAyO2lmKGZtdC5mb3JtYXRDb2RlPT0zJiZmbXQuYml0c1BlclNhbXBsZT09MzImJmZtdC5ieXRlc1BlckZyYW1lPT1leHBlY3RlZEJ5dGVzUGVyRnJhbWUpcmV0dXJuIDM7dGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBXQVYgZmlsZSB0eXBlLCBmb3JtYXRDb2RlPSR7Zm10LmZvcm1hdENvZGV9LCBiaXRzUGVyU2FtcGxlPSR7Zm10LmJpdHNQZXJTYW1wbGV9LCBieXRlc1BlckZyYW1lPSR7Zm10LmJ5dGVzUGVyRnJhbWV9LCBudW1iZXJPZkNoYW5uZWxzPSR7Zm10Lm51bWJlck9mQ2hhbm5lbHN9LmApfWZ1bmN0aW9uIGRlY29kZURhdGFDaHVuayhkYXRhLGZtdCx3YXZGaWxlVHlwZSl7c3dpdGNoKHdhdkZpbGVUeXBlKXtjYXNlIDA6cmV0dXJuIGRlY29kZURhdGFDaHVua191aW50OChkYXRhLGZtdCk7Y2FzZSAxOnJldHVybiBkZWNvZGVEYXRhQ2h1bmtfaW50MTYoZGF0YSxmbXQpO2Nhc2UgMjpyZXR1cm4gZGVjb2RlRGF0YUNodW5rX2ludDI0KGRhdGEsZm10KTtjYXNlIDM6cmV0dXJuIGRlY29kZURhdGFDaHVua19mbG9hdDMyKGRhdGEsZm10KTtkZWZhdWx0OnRocm93IG5ldyBFcnJvcigiTm8gZGVjb2Rlci4iKX19ZnVuY3Rpb24gZGVjb2RlRGF0YUNodW5rX2ludDE2KGRhdGEsZm10KXtsZXQgY2hhbm5lbERhdGE9YWxsb2NhdGVDaGFubmVsRGF0YUFycmF5cyhkYXRhLmJ5dGVMZW5ndGgsZm10KSxudW1iZXJPZkNoYW5uZWxzPWZtdC5udW1iZXJPZkNoYW5uZWxzLG51bWJlck9mRnJhbWVzPWNoYW5uZWxEYXRhWzBdLmxlbmd0aCxvZmZzPTA7Zm9yKGxldCBmcmFtZU5vPTA7ZnJhbWVObzxudW1iZXJPZkZyYW1lcztmcmFtZU5vKyspZm9yKGxldCBjaGFubmVsTm89MDtjaGFubmVsTm88bnVtYmVyT2ZDaGFubmVscztjaGFubmVsTm8rKyl7bGV0IHNhbXBsZVZhbHVlRmxvYXQ9ZGF0YS5nZXRJbnQxNihvZmZzLCEwKS8zMjc2ODtjaGFubmVsRGF0YVtjaGFubmVsTm9dW2ZyYW1lTm9dPXNhbXBsZVZhbHVlRmxvYXQsb2Zmcys9Mn1yZXR1cm4gY2hhbm5lbERhdGF9ZnVuY3Rpb24gZGVjb2RlRGF0YUNodW5rX3VpbnQ4KGRhdGEsZm10KXtsZXQgY2hhbm5lbERhdGE9YWxsb2NhdGVDaGFubmVsRGF0YUFycmF5cyhkYXRhLmJ5dGVMZW5ndGgsZm10KSxudW1iZXJPZkNoYW5uZWxzPWZtdC5udW1iZXJPZkNoYW5uZWxzLG51bWJlck9mRnJhbWVzPWNoYW5uZWxEYXRhWzBdLmxlbmd0aCxvZmZzPTA7Zm9yKGxldCBmcmFtZU5vPTA7ZnJhbWVObzxudW1iZXJPZkZyYW1lcztmcmFtZU5vKyspZm9yKGxldCBjaGFubmVsTm89MDtjaGFubmVsTm88bnVtYmVyT2ZDaGFubmVscztjaGFubmVsTm8rKyl7bGV0IHNhbXBsZVZhbHVlRmxvYXQ9KGRhdGEuZ2V0VWludDgob2ZmcyktMTI4KS8xMjg7Y2hhbm5lbERhdGFbY2hhbm5lbE5vXVtmcmFtZU5vXT1zYW1wbGVWYWx1ZUZsb2F0LG9mZnMrPTF9cmV0dXJuIGNoYW5uZWxEYXRhfWZ1bmN0aW9uIGRlY29kZURhdGFDaHVua19pbnQyNChkYXRhLGZtdCl7bGV0IGNoYW5uZWxEYXRhPWFsbG9jYXRlQ2hhbm5lbERhdGFBcnJheXMoZGF0YS5ieXRlTGVuZ3RoLGZtdCksbnVtYmVyT2ZDaGFubmVscz1mbXQubnVtYmVyT2ZDaGFubmVscyxudW1iZXJPZkZyYW1lcz1jaGFubmVsRGF0YVswXS5sZW5ndGgsb2Zmcz0wO2ZvcihsZXQgZnJhbWVObz0wO2ZyYW1lTm88bnVtYmVyT2ZGcmFtZXM7ZnJhbWVObysrKWZvcihsZXQgY2hhbm5lbE5vPTA7Y2hhbm5lbE5vPG51bWJlck9mQ2hhbm5lbHM7Y2hhbm5lbE5vKyspe2xldCBzYW1wbGVWYWx1ZUZsb2F0PWdldEludDI0KGRhdGEsb2ZmcykvODM4ODYwODtjaGFubmVsRGF0YVtjaGFubmVsTm9dW2ZyYW1lTm9dPXNhbXBsZVZhbHVlRmxvYXQsb2Zmcys9M31yZXR1cm4gY2hhbm5lbERhdGF9ZnVuY3Rpb24gZGVjb2RlRGF0YUNodW5rX2Zsb2F0MzIoZGF0YSxmbXQpe2xldCBjaGFubmVsRGF0YT1hbGxvY2F0ZUNoYW5uZWxEYXRhQXJyYXlzKGRhdGEuYnl0ZUxlbmd0aCxmbXQpLG51bWJlck9mQ2hhbm5lbHM9Zm10Lm51bWJlck9mQ2hhbm5lbHMsbnVtYmVyT2ZGcmFtZXM9Y2hhbm5lbERhdGFbMF0ubGVuZ3RoLG9mZnM9MDtmb3IobGV0IGZyYW1lTm89MDtmcmFtZU5vPG51bWJlck9mRnJhbWVzO2ZyYW1lTm8rKylmb3IobGV0IGNoYW5uZWxObz0wO2NoYW5uZWxObzxudW1iZXJPZkNoYW5uZWxzO2NoYW5uZWxObysrKXtsZXQgc2FtcGxlVmFsdWVGbG9hdD1kYXRhLmdldEZsb2F0MzIob2ZmcywhMCk7Y2hhbm5lbERhdGFbY2hhbm5lbE5vXVtmcmFtZU5vXT1zYW1wbGVWYWx1ZUZsb2F0LG9mZnMrPTR9cmV0dXJuIGNoYW5uZWxEYXRhfWZ1bmN0aW9uIGFsbG9jYXRlQ2hhbm5lbERhdGFBcnJheXMoZGF0YUxlbmd0aCxmbXQpe2xldCBudW1iZXJPZkZyYW1lcz1NYXRoLmZsb29yKGRhdGFMZW5ndGgvZm10LmJ5dGVzUGVyRnJhbWUpLGNoYW5uZWxEYXRhPW5ldyBBcnJheShmbXQubnVtYmVyT2ZDaGFubmVscyk7Zm9yKGxldCBjaGFubmVsTm89MDtjaGFubmVsTm88Zm10Lm51bWJlck9mQ2hhbm5lbHM7Y2hhbm5lbE5vKyspY2hhbm5lbERhdGFbY2hhbm5lbE5vXT1uZXcgRmxvYXQzMkFycmF5KG51bWJlck9mRnJhbWVzKTtyZXR1cm4gY2hhbm5lbERhdGF9ZnVuY3Rpb24gdmVyaWZ5RGF0YUNodW5rTGVuZ3RoKGRhdGEsZm10KXtpZighZGF0YSl0aHJvdyBuZXcgRXJyb3IoIk5vIGRhdGEgY2h1bmsgZm91bmQgaW4gV0FWIGZpbGUuIik7aWYoZGF0YS5ieXRlTGVuZ3RoJWZtdC5ieXRlc1BlckZyYW1lIT0wKXRocm93IG5ldyBFcnJvcigiV0FWIGZpbGUgZGF0YSBjaHVuayBsZW5ndGggaXMgbm90IGEgbXVsdGlwbGUgb2YgZnJhbWUgc2l6ZS4iKX1mdW5jdGlvbiBnZXRXYXZGaWxlSW5mbyhmaWxlRGF0YSl7bGV0IGNodW5rcz11bnBhY2tXYXZGaWxlQ2h1bmtzKGZpbGVEYXRhKSxjaHVua0luZm89Z2V0Q2h1bmtJbmZvKGNodW5rcyksZm10PWRlY29kZUZvcm1hdENodW5rKGNodW5rcy5nZXQoImZtdCIpKTtyZXR1cm57Y2h1bmtJbmZvLGZtdH19ZnVuY3Rpb24gZ2V0Q2h1bmtJbmZvKGNodW5rcyl7bGV0IGNodW5rSW5mbz1bXTtmb3IobGV0IGUgb2YgY2h1bmtzKXtsZXQgY2k9e307Y2kuY2h1bmtJZD1lWzBdLGNpLmRhdGFPZmZzZXQ9ZVsxXS5ieXRlT2Zmc2V0LGNpLmRhdGFMZW5ndGg9ZVsxXS5ieXRlTGVuZ3RoLGNodW5rSW5mby5wdXNoKGNpKX1yZXR1cm4gY2h1bmtJbmZvLnNvcnQoKGUxLGUyKT0+ZTEuZGF0YU9mZnNldC1lMi5kYXRhT2Zmc2V0KSxjaHVua0luZm99ZnVuY3Rpb24gY29uY2F0KGxpc3QsbGVuZ3RoKXtpZihsaXN0Lmxlbmd0aD09PTApcmV0dXJuIG5ldyBVaW50OEFycmF5O2lmKGxlbmd0aD09PXZvaWQgMCl7bGVuZ3RoPTA7Zm9yKGxldCBpPTA7aTxsaXN0Lmxlbmd0aDtpKyspbGlzdFtpXS5sZW5ndGgmJihsZW5ndGgrPWxpc3RbaV0ubGVuZ3RoKX1sZXQgYnVmZmVyPW5ldyBVaW50OEFycmF5KGxlbmd0aCkscG9zPTA7Zm9yKGxldCBpPTA7aTxsaXN0Lmxlbmd0aDtpKyspe2xldCBidWY9bGlzdFtpXTtwb3MrPV9jb3B5QWN0dWFsKGJ1ZixidWZmZXIscG9zLDAsYnVmLmxlbmd0aCl9cmV0dXJuIHBvczxsZW5ndGgmJmJ1ZmZlci5maWxsKDAscG9zLGxlbmd0aCksYnVmZmVyfWZ1bmN0aW9uIF9jb3B5QWN0dWFsKHNvdXJjZSx0YXJnZXQsdGFyZ2V0U3RhcnQsc291cmNlU3RhcnQsc291cmNlRW5kKXtzb3VyY2VFbmQtc291cmNlU3RhcnQ+dGFyZ2V0Lmxlbmd0aC10YXJnZXRTdGFydCYmKHNvdXJjZUVuZD1zb3VyY2VTdGFydCt0YXJnZXQubGVuZ3RoLXRhcmdldFN0YXJ0KTtsZXQgbmI9c291cmNlRW5kLXNvdXJjZVN0YXJ0LHNvdXJjZUxlbj1zb3VyY2UubGVuZ3RoLXNvdXJjZVN0YXJ0O3JldHVybiBuYj5zb3VyY2VMZW4mJihuYj1zb3VyY2VMZW4pLChzb3VyY2VTdGFydCE9PTB8fHNvdXJjZUVuZDxzb3VyY2UubGVuZ3RoKSYmKHNvdXJjZT1uZXcgVWludDhBcnJheShzb3VyY2UuYnVmZmVyLHNvdXJjZS5ieXRlT2Zmc2V0K3NvdXJjZVN0YXJ0LG5iKSksdGFyZ2V0LnNldChzb3VyY2UsdGFyZ2V0U3RhcnQpLG5ifWZ1bmN0aW9uIGVuc3VyZU1vbm9QY20oY2hhbm5lbERhdGEpe2xldHtsZW5ndGg6bnVtYmVyT2ZDaGFubmVsc309Y2hhbm5lbERhdGE7aWYobnVtYmVyT2ZDaGFubmVscz09PTEpcmV0dXJuIGNoYW5uZWxEYXRhWzBdO2xldCBtb25vRGF0YT1uZXcgRmxvYXQzMkFycmF5KGNoYW5uZWxEYXRhWzBdLmxlbmd0aCk7Zm9yKGxldCBpPTA7aTxtb25vRGF0YS5sZW5ndGg7aSsrKXtsZXQgc3VtPTA7Zm9yKGxldCBqPTA7ajxudW1iZXJPZkNoYW5uZWxzO2orKylzdW0rPWNoYW5uZWxEYXRhW2pdW2ldO21vbm9EYXRhW2ldPXN1bS9udW1iZXJPZkNoYW5uZWxzfXJldHVybiBtb25vRGF0YX1mdW5jdGlvbiBlbnN1cmVTMTZsZVBjbShpbnB1dCl7bGV0IG51bWJlck9mRnJhbWVzPWlucHV0Lmxlbmd0aCxieXRlc1BlclNhbXBsZT1NYXRoLmNlaWwoMTYvOCksZmlsZUxlbmd0aD1udW1iZXJPZkZyYW1lcypieXRlc1BlclNhbXBsZSxhcnJheUJ1ZmZlcj1uZXcgQXJyYXlCdWZmZXIoZmlsZUxlbmd0aCksaW50MTZBcnJheT1uZXcgSW50MTZBcnJheShhcnJheUJ1ZmZlcik7Zm9yKGxldCBvZmZzZXQ9MDtvZmZzZXQ8bnVtYmVyT2ZGcmFtZXM7b2Zmc2V0Kyspe2xldCBzYW1wbGVWYWx1ZUZsb2F0PWlucHV0W29mZnNldF0sc2FtcGxlVmFsdWVJbnQxNj1mbG9hdFRvU2lnbmVkSW50MTYoc2FtcGxlVmFsdWVGbG9hdCk7aW50MTZBcnJheVtvZmZzZXRdPXNhbXBsZVZhbHVlSW50MTZ9cmV0dXJuIGFycmF5QnVmZmVyfWZ1bmN0aW9uIGZsb2F0VG9TaWduZWRJbnQxNih2KXtyZXR1cm4gdio9MzI3Njgsdj1+fnYsdj4zMjc2Nz8zMjc2Nzp2fWFzeW5jIGZ1bmN0aW9uIGVuY29kZShpbnB1dCxzYW1wbGVSYXRlKXtsZXQgaW5zdGFuY2U9YXdhaXQgc2lsa193YXNtX2RlZmF1bHQoKSxidWZmZXI9QXJyYXlCdWZmZXIuaXNWaWV3KGlucHV0KT9pbnB1dC5idWZmZXI6aW5wdXQ7aWYoaXNXYXZGaWxlKGlucHV0KSl7bGV0e2NoYW5uZWxEYXRhLHNhbXBsZVJhdGU6d2F2U2FtcGxlUmF0ZX09ZGVjb2RlV2F2RmlsZShpbnB1dCk7c2FtcGxlUmF0ZXx8PXdhdlNhbXBsZVJhdGUsYnVmZmVyPWVuc3VyZVMxNmxlUGNtKGVuc3VyZU1vbm9QY20oY2hhbm5lbERhdGEpKX1sZXQgYXJyPVtdLG91dHB1dExlbmd0aD0wLHJldD1pbnN0YW5jZS5zaWxrX2VuY29kZShidWZmZXIsYnVmZmVyLmJ5dGVMZW5ndGgsc2FtcGxlUmF0ZSxjaHVuaz0+e291dHB1dExlbmd0aCs9Y2h1bmsubGVuZ3RoLGFyci5wdXNoKGNodW5rLnNsaWNlKCkpfSk7aWYocmV0PT09MCl0aHJvdyBuZXcgRXJyb3IoInNpbGsgZW5jb2RpbmcgZmFpbHVyZSIpO2xldCBsYXN0PWFyci5wb3AoKTtyZXR1cm4gbGFzdCYmKGFyci5wdXNoKGxhc3Quc2xpY2UoMCwtMSkpLG91dHB1dExlbmd0aC0tKSx7ZGF0YTpjb25jYXQoYXJyLG91dHB1dExlbmd0aCksZHVyYXRpb246cmV0fX1hc3luYyBmdW5jdGlvbiBkZWNvZGUoaW5wdXQsc2FtcGxlUmF0ZSl7bGV0IGluc3RhbmNlPWF3YWl0IHNpbGtfd2FzbV9kZWZhdWx0KCksYnVmZmVyPUFycmF5QnVmZmVyLmlzVmlldyhpbnB1dCk/aW5wdXQuYnVmZmVyOmlucHV0LGFycj1bXSxvdXRwdXRMZW5ndGg9MCxyZXQ9aW5zdGFuY2Uuc2lsa19kZWNvZGUoYnVmZmVyLGJ1ZmZlci5ieXRlTGVuZ3RoLHNhbXBsZVJhdGUsY2h1bms9PntvdXRwdXRMZW5ndGgrPWNodW5rLmxlbmd0aCxhcnIucHVzaChjaHVuay5zbGljZSgpKX0pO2lmKHJldD09PTApdGhyb3cgbmV3IEVycm9yKCJzaWxrIGRlY29kaW5nIGZhaWx1cmUiKTtyZXR1cm57ZGF0YTpjb25jYXQoYXJyLG91dHB1dExlbmd0aCksZHVyYXRpb246cmV0fX1mdW5jdGlvbiBnZXREdXJhdGlvbihzaWxrLGZyYW1lTXM9MjApe2xldCBidWZmZXI9QXJyYXlCdWZmZXIuaXNWaWV3KHNpbGspP3NpbGsuYnVmZmVyOnNpbGssb2Zmc2V0PXNpbGtbMF09PT0yPzEwOjksYmxvY2tzPTAsdmlldz1uZXcgRGF0YVZpZXcoYnVmZmVyKTtmb3IoO29mZnNldDx2aWV3LmJ5dGVMZW5ndGg7KXtsZXQgc2l6ZT12aWV3LmdldFVpbnQxNihvZmZzZXQsITApO2Jsb2Nrcys9MSxvZmZzZXQrPXNpemUrMn1yZXR1cm4gYmxvY2tzKmZyYW1lTXN9ZnVuY3Rpb24gaXNXYXYoZmlsZURhdGEpe3JldHVybiBpc1dhdkZpbGUoZmlsZURhdGEpfWZ1bmN0aW9uIGdldFdhdkZpbGVJbmZvMihmaWxlRGF0YSl7cmV0dXJuIGdldFdhdkZpbGVJbmZvKGZpbGVEYXRhKX1leHBvcnR7ZGVjb2RlLGVuY29kZSxnZXREdXJhdGlvbixnZXRXYXZGaWxlSW5mbzIgYXMgZ2V0V2F2RmlsZUluZm8saXNXYXZ9Owo=", import.meta.url)), Q = (p, G) => (p = ce(p) ? new URL(p) : u.normalize(p), l.readFileSync(p, G ? void 0 : "utf8")), o = (p) => (p = Q(p, !0), p.buffer || (p = new Uint8Array(p)), p), E = (p, G, b, L = !0) => {
        p = ce(p) ? new URL(p) : u.normalize(p), l.readFile(p, L ? void 0 : "utf8", (J, q) => {
          J ? b(J) : G(L ? q.buffer : q);
        });
      }, process.argv.slice(2);
    } else
      (n || I) && (I ? a = self.location.href : typeof document < "u" && document.currentScript && (a = document.currentScript.src), e && (a = e), a.startsWith("blob:") ? a = "" : a = a.substr(0, a.replace(/[?#].*/, "").lastIndexOf("/") + 1), Q = (y) => {
        var p = new XMLHttpRequest();
        return p.open("GET", y, !1), p.send(null), p.responseText;
      }, I && (o = (y) => {
        var p = new XMLHttpRequest();
        return p.open("GET", y, !1), p.responseType = "arraybuffer", p.send(null), new Uint8Array(p.response);
      }), E = (y, p, G) => {
        var b = new XMLHttpRequest();
        b.open("GET", y, !0), b.responseType = "arraybuffer", b.onload = () => {
          b.status == 200 || b.status == 0 && b.response ? p(b.response) : G();
        }, b.onerror = G, b.send(null);
      });
    A.print || console.log.bind(console);
    var C = A.printErr || console.error.bind(console);
    Object.assign(A, g), g = null;
    var s;
    A.wasmBinary && (s = A.wasmBinary);
    var f, h = !1, x, d, m, H, v, N, M, Z;
    function V() {
      var y = f.buffer;
      A.HEAP8 = x = new Int8Array(y), A.HEAP16 = m = new Int16Array(y), A.HEAPU8 = d = new Uint8Array(y), A.HEAPU16 = H = new Uint16Array(y), A.HEAP32 = v = new Int32Array(y), A.HEAPU32 = N = new Uint32Array(y), A.HEAPF32 = M = new Float32Array(y), A.HEAPF64 = Z = new Float64Array(y);
    }
    var EA = [], _ = [], gA = [];
    function cA() {
      var y = A.preRun.shift();
      EA.unshift(y);
    }
    var sA = 0, LA = null;
    function _A(y) {
      var p;
      throw (p = A.onAbort) == null || p.call(A, y), y = "Aborted(" + y + ")", C(y), h = !0, y = new WebAssembly.RuntimeError(y + ". Build with -sASSERTIONS for more info."), B(y), y;
    }
    var pe = (y) => y.startsWith("data:application/octet-stream;base64,"), ce = (y) => y.startsWith("file://"), yA;
    if (A.locateFile) {
      if (yA = "silk_wasm.wasm", !pe(yA)) {
        var MA = yA;
        yA = A.locateFile ? A.locateFile(MA, a) : a + MA;
      }
    } else
      yA = new URL("data:application/wasm;base64,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DQALIBhBEHVBiq5/bCAYQf//A3FB9tEAbEEQdmtBgBBqEB4hBEHREBAeIQACfyAAQYAIEB4iBcEiBiALKAKIswEiA0H//wNxbEEQdSADQRB1IAZsaiAFQQ91QQFqQQF1IANsaiIDaiIFQQBOBEBBgICAgHggBSAAIANxQQBIGwwBC0H/////ByAFIAAgA3JBAE4bCyEDIA1B/////wcgBMEiACANKAKEASIFQRB1bCAFIARBD3VBAWpBAXUiBGxqIAVB//8DcSAAbEEQdWoiBSAFQf////8HTxs2AoQBIA1B/////wcgDSgCiAEiBUEQdSAAbCAEIAVsaiAFQf//A3EgAGxBEHVqIgUgBUH/////B08bNgKIASANQf////8HIA0oAowBIgVBEHUgAGwgBCAFbGogBUH//wNxIABsQRB1aiIFIAVB/////wdPGzYCjAEgDUH/////B0H/////ByANKAKAASIFQRB1IABsIAQgBWxqIAVB//8DcSAAbEEQdWoiACAAQf////8HTxsgA2oiACAAQQBIGyIANgKAASALAn8gCygClLMBQRB0QRF1QQFqQQF1IgQgACALKAKIswEiAGsiBUH//wNxbEEQdSAEIAVBEHVsaiIEIABqIgVBAE4EQEGAgICAeCAFIAAgBHFBAEgbDAELQf////8HIAUgACAEckEAThsLNgKIswEgDUH/////ByANKAKEASADaiIAIABBAEgbIgA2AoQBIAsCfyALKAKUswFBEHRBEXVBAWpBAXUiBCAAIAsoAoizASIAayIFQf//A3FsQRB1IAQgBUEQdWxqIgQgAGoiBUEASARAQf////8HIAUgACAEckEAThsMAQtBgICAgHggBSAAIARxQQBIGws2AoizASANQf////8HIA0oAogBIANqIgAgAEEASBsiADYCiAEgCwJ/IAsoApSzAUEQdEERdUEBakEBdSIEIAAgCygCiLMBIgBrIgVB//8DcWxBEHUgBCAFQRB1bGoiBCAAaiIFQQBIBEBB/////wcgBSAAIARyQQBOGwwBC0GAgICAeCAFIAAgBHFBAEgbCzYCiLMBIA1B/////wcgDSgCjAEgA2oiACAAQQBIGyIANgKMASALAn8gCygClLMBQRB0IgNBEXVBAWpBAXUiBCAAIAsoAoizASIAayIFQf//A3FsQRB1IAQgBUEQ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KAIAIgYgCkHcqwFqKAIAIgcgBSAKQcyxAWooAgAiChAdIAMoAgwhCSAaIAAgFSAUIAYgByAFIAoQHSADKAIMIR8gGCAAIA8gFiAGIAcgBSAKEB0gAygCDCEZIBMgACAMIA4gBiAHIAUgChAdIARB/v///wdB/v///wcgAygCDEH/////ByAZQf////8HIB9B/////wcgCSAJQQBIG2oiACAAQQBIG2oiACAAQQBIG2oiACAAQf7///8HThsgAEEASBsiAEoEQCANIAMpAxA3AgwgDSADKQMYNwIUIA0gETYCCCAAIQQLIAAgEEgNAiARQQJJIUogEUEBaiERIEoNAAsMAQsgA0EQaiIEIANBDGoiACAIIBdBwLEBKAIAIgZB3KsBKAIAIgcgBUHMsQEoAgAiChAdIAMoAgwhCSAEQQRyIhAgACAIQQpqIg4gF0HkAGoiDCAGIAcgBSAKEB0gAygCDCERIARBCHIiFiAAIAhBFGoiDyAXQcgBaiIUIAYgByAFIAoQHSADKAIMIRogBEEMciIVIAAgCEEeaiITIBdBrAJqIhggBiAHIAUgChAdIAMoAgwhHyANIAMpAxg3AhQgDSADKQMQNwIMIA1BADYCCCAEIAAgCCAXQcSxASgCACIEQeCrASgCACIGIAVB0LEBKAIAIgcQHSADKAIMIQogECAAIA4gDCAEIAYgBSAHEB0gAygCDCEZIBYgACAPIBQgBCAGIAUgBxAdIAMoAgwhHiAVIAAgEyAYIAQgBiAFIAcQHUH+////B0H+////ByAfQf////8HIBpB/////wcgEUH/////ByAJIAlBAEgbaiIAIABBAEgbaiIAIABBAEgbaiIAIABB/v///wdOGyAAQQBIGyERAkAgAygCDEH/////ByAeQf////8HIBlB/////wcgCiAKQQBIG2oiACAAQQBIG2oiACAAQQBIG2oiAEEASA0AIAAgEU4NACANIAMpAxA3AgwgDSADKQMYNwIUIA1BATYCCEH+////ByAAIABB/v///wdOGyERCyADQRBqIANBDGoiACAIIBdByLEBKAIAIgRB5KsBKAIAIgYgBUHUsQEoAgAiBxAdIAMoAgwhCiAQIAAgDiAMIAQgBiAFIAcQHSADKAIMIQkgFiAAIA8gFCAEIAYgBSAHEB0gAygCDCEQIBUgACATIBggBCAGIAUg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AtSQAQwBCyALQoCAgIAQNwLckAEgC0EANgLUkAELIAsoAux+RQRAIAtCgAg3AgAgC0EANgIQIAtCgICAgPD/PzcCCCALQQA2AvB+CyALIBtBkCdqIAsgC0GMkQFqEEggMCAwIAsoAtB2IgBBAXRqIAsoAsh2QQVsIABqQQF0EDYgCyAbKAL4JzYCrHYgGygCiCghAEEAIQMgC0EANgKcdyALIAA2ArR2IAsoAhBFBEAgCygC7H5BAWohAwsgCyADNgLsfgJAIAsoAuh2IANBFGxMBEAgC0EDIAtBgP8AaiIAIAsoApCPASIEQX9zQQFxIgZBiAhsaigChAgiB0EBRkEBdCAAIARBiAhsaigChAhBAkYiBRtB4JoBEBUgCyAbQYwnahAnGgJAIBsoAownIAIuAQBMBEAgCxBJIAEgC0EUaiAbKAKMJyIDEBQhCAJAIAVFIAdBAUdxDQAgAi4BACAAIAQgBiAFG0GICGxqIgEoAoAIIgQgA2pIDQAgAyAIaiABIAQQFBogASgCgAggA2ohAwsgAiADOwEAIAAgCygCkI8BQYgIbGogG0EQaiAbLgEOIgEQFBogACALKAKQjwEiAkGICGxqIgAgATYCgAggACAbKAKMKDYChAggCyACQX9zQQFxNgKQjwEMAQtBACEDIAJBADsBAEF8ITMLIAtBADYC7H4MAQsgAkEAOwEAIAtBAUHgmgEQFSALIBtBjCdqECcaIBsoAownIQMLIAsoAvB+IQAgCyADNgLwfiALQeQAIAsoApCzASADIABrQcA+bCALKALkdm1qIgBBFGtBACAAQRROGyAAQfgAShs2ApCzASALKAIQIQAgCygClLMBQbQBTgRAIAtB/////wcgCygCgJEBIgFBFGogAUFrTBs2AoCRAQsgG0GwLGokAEF3IDMgABsLmBMBFH8gASgCBCEIAkAgA0EATA0AIAgoAgQgAigCACADbEEBdGohCSADQQRPBEAgA0H8////B3EhCgNAIAAgBEECdGogCSAEQQF0ai4BADYCACAAIARBAXIiC0ECdGogCSALQQF0ai4BADYCACAAIARBAnIiC0ECdGogCSALQQF0ai4BADYCACAAIARBA3IiC0ECdGogCSALQQF0ai4BADYCACAEQQRqIQQgBkEEaiIGIApHDQALCyADQQNxIgZFDQADQCAAIARBAnRq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C/AGdW5zaWduZWQgc2hvcnQAdW5zaWduZWQgaW50AGZsb2F0AHVpbnQ2NF90AHVuc2lnbmVkIGNoYXIAc3RkOjpleGNlcHRpb24AYm9vbAB1bnNpZ25lZCBsb25nAHN0ZDo6d3N0cmluZwBiYXNpY19zdHJpbmcAc3RkOjpzdHJpbmcAc3RkOjp1MTZzdHJpbmcAc3RkOjp1MzJzdHJpbmcAZG91YmxlAHNpbGtfZW5jb2RlAHNpbGtfZGVjb2RlAHZvaWQAZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8c2hvcnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIHNob3J0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGludD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8ZmxvYXQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQ4X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDE2X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDE2X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQ2NF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQ2NF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50MzJfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50MzJfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8Y2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgY2hhcj4Ac3RkOjpiYXNpY19zdHJpbmc8dW5zaWduZWQgY2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8c2lnbmVkIGNoYXI+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGxvbmc+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGxvbmc+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGRvdWJsZT4AAiMhU0lMS19WMwBBgA8LxQHgcAAA1AcAAOBw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9hYmLAGg9h4lJgHK9ickIQH19jEjGwEh9zsiFQFN90chDwF691MgCQGn92AfAwHV928e/AAD+H4d9gAy+I8c7wBh+KAb6ACQ+LMa4gDA+McZ2wDx+NwY1AAi+fMXzABT+QsXxQCE+SQWvgC1+T8VtwDn+VwUrwAZ+noTqABM+pkSoAB++roRmACx+t0QkQDj+gIQiQAW+ygPgQBJ+1AOeQB8+3oNcQCv+6YMaQDi+9QLYQAV/AQLWQBI/DYKUQB7/GkJSQCt/J8ITy9MJisgvBtfGL0VnhPfEWoQLQ8cDi8NXwyoCwQLcgruCXYJCQmmCEsI9gepB2EHHgfgBqYGAEGypQELFwIA////////AAAAAAEAAQAAAAEAAAABAEHUpQELAQEAQeClAQsJAQAAAAAAAAABAEH0pQELeP//AgABAAAAAQABAAAAAAD/////AAAAAAAAAAD3//n/+v/7//v//P/8//3//f/+//7//v////////8AAAAAAAABAAEAAAABAAIAAgACAAMAAwAEAAQABQAGAAUABgAIAP3//v/+//7//////////////wAAAAD//wBB+KYBC0EBAAAAAAAAAAEAAQAAAAEAAQACAAEAAgACAAIAAgADAAMAAwACAAIAAgACAAEAAgABAAEAAAABAAEAAAAAAAAAAQBBxqcBC58B//8AAAAA//////////////7//v/+/wkACAAGAAUABgAFAAQABAADAAMAAgACAAIAAQAAAAEAAQAAAAAAAAD////////+//7//v/9//3//P/8//v/+//6//n//v8GAP//BQD//wUA/v8HAPz/CAD//wYA//8GAPz/CQD3/wwA/f8HAP7/BwD5/w0AEAAYACIACQAFAAAAAAAAUlSf//8BAEHyqAELFOTAv9Su3EXkxerz8An2Qvo3/f//AEGSqQELkAHKYr53fovCnbmnwrBjuQPBlMjuzvXUqNpP4PHlfevj8K/1U/nU/P//AAAAAAAAAABeE98kDTXmRJNUt2F5bU92ln4ahpCN8pRum0GhDKfFrGyy6bcvvQvCocbcyubOxdKY1j3a1d1s4YjkleeL6nztZvAK85f1+/dM+kf8Jv7//wAAAQAAAAMAAAAKAAAAAisAQbCqAQsUGgDsAEEBRQFTAVgBagF7AZwBogEAQdCqAQuWAVgA5wDtAPQALAE1ATkBRAFFAVUBWgFfAWABYAFiAWQBbwGJAYwBlgEAAAAAAAAAAO4A+AD/AAEBAgESARwBNwE9AUYBRgFHAVMBXQFeAV8BYAFjAWYBbgFzAXsBfwGDAYQBiQGKAYoBlwGZAZwBnAGdAaYBqgGwAbIBwQHGAccBcFQAAJBUAADAVAAAMFUAAFBVAACAVQBB8KsBC2RSAtgDGAv9A50CCgAjADAB//8XAEr9gwf7EZ8LHwmFCWgMwg6UB+EB1gDS/74eNhH3/YD80hI1IVcGifxI/WoMUBnS/jkEBQJXAuoDNwIwAuX3vvxoEqz+gAObBXz9mQ+c/fH3AEHgrAEL9QR3BmYLiRPCC+8GcQDGAFgDsACyALX8rwmyHvsUPgI7AOwU4B0iC8X+AA/zEn8ZLwYv+1QG4AYaCVQH/Qff/T4HEC4LBs3+pP2xAvkU0hOpEAkCzfplJkEYRfvd+lsaySZ++iICdQBw//oKcQZ4FBAVlA15Cdr/eQIOAD/+mhTbDVX/nv+LAZojjAZMA3T8Aw+dIkP8wgWMAVsaAxW3/vUEsf4OC7kQDgHK/94F6RX+Ip0XCwiO/t8BkxReFpYEdRSI+24ZxwEAAgAAAAAAAAAA6v6fAYEkwhtR/hL8Fw80JXQSmfxG/BASyi3NA9T+i/+aG4sgpwd7/FECVA22FzITHwY2AM3/SjGEELT8VQzWEm0UCQnNAgz/iQR2NwsDRQA+++MVXjID9+kDfP94DzYlQQIOB5/5byL0KGz2fwPrAMIB2wSbArUBvwO69ZEqRCLE+HQJ/ge9IksR3/kXALMbpCD7+uQFk/tDA+4dmxfwCrcBhwEIK80IUgUE/DwLfDSvDzT0JAR+9cg0vRWO+nT6Rx+dLGj/ePmD/E8LSjwu+p8A4vusAbAvWiHw8uwG6PqpHSkYMQINAkn7AxqPK277twFrCocSNwmLFYcLCB3lHhr/5Pm4/1wIZRVvBSwG3AHg+ig+fgj9+2kWuQG9CfsHxQrkANX/CwcHGpgb9BHeI30HOP/LAED9By9LFVz7HgL2BvD7XidZHTH1vvVDHjsjPgCuBusAF/+KC6kqmwdmKv4K0ASR/94A2wjaCiUwnACG+Xr0nx/KPwwB1vFDACMIDh+w/4D2BgK+/7YGnwGrLPBVAABgVgAAMFcAAAoAAAAUAAAAKABB4LEBCxSZeWZmAEAzM2YmmhkzE8wMPQqaCQBBgbIBC5AEIAAA/h8AAPYfAADqHwAA2B8AAMIfAACoHwAAiB8AAGIfAAA6HwAACh8AANgeAACgHgAAYh4AACIeAADcHQAAkB0AAEIdAADuHAAAlhwAADocAADYGwAAchsAAAobAACcGgAAKhoAALQZAAA6GQAAvBgAADwYAAC2FwAALhcAAKAWAAAQFgAAfhUAAOgUAABOFAAAsBMAABATAABuEgAAyBEAAB4RAAB0EAAAxg8AABYPAABkDgAArg0AAPgMAABADAAAhAsAAMgKAAAKCgAASgkAAIoIAADGBwAAAgcAAD4GAAB4BQAAsgQAAOoDAAAiAwAAWgIAAJIBAADKAAAAAAAAADb///9u/v//pv3//978//8W/P//Tvv//4j6///C+f///vj//zr4//929///tvb///b1//849f//fPT//8Dz//8I8///UvL//5zx///q8P//OvD//4zv///i7v//OO7//5Lt///w7P//UOz//7Lr//8Y6///gur///Dp//9g6f//0uj//0ro///E5///ROf//8bm//9M5v//1uX//2Tl///25P//juT//yjk///G4///auP//xLj//++4v//cOL//yTi///e4f//nuH//2Dh//8o4f//9uD//8bg//+e4P//eOD//1jg//8+4P//KOD//xbg//8K4P//AuD//wDg//8AAJKSRqC0rP//AAACAEGitgELJlbhLu+W8///AACqR4Oci6r//wAApljXXrOK//8AALMXLxzSMv//AEHStgELgwISAC0AXgC1AEABBwIJA0UEvAV1B3EJtQtJDjQRfRQpGDwcwCDAJT0rNDGkN5Y+EUYLTmlWGV8WaF1x3nqHhFaORphCoiSsxLUIv9jHEdCQ10jeNuRb6brtYfFo9Or2+vil+vj7Af3Q/W3+4f4y/2r/kP+r/7//z//d/+n/9P///wAA1gBFAu0ESAlQD24W0B3pJJUr7DEQOBk+E0QFSu5PxVWGWzlh5maEbAdyb3fQfEGCy4dojQqTq5hHnsqjG6k6rj2zMrgSvdPBdcb3yk3Pb9Nk10DbDd/I4mPm0+kU7Rzw4fJc9Yj3Zfny+jP8Mv3//aD+Gv9v/6f/yv/h//H///8gAEHiuAEL4wI2CRAPbxsQPELP/+Zz8ED1CvjN+Qn73vuH/A/9fv3a/Rz+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AbYAkgCQAKYAzwAFAUIBhAHCAQQCRgJ9AsYC+gI1A0ADgAObA94CxAEvAdgAqgCZAJ4AtgDcABIBUQGWAekBQwKpAoADKwOAA8ADmwMABH0AkwCqAMoA6AAJAScBTAFwAZYBuwHjAQgCMwJeAoYCwALjAvUC4wEdAegAyAC+AMEAzgDgAPQACgEhATsBVAFvAYoBqQHOAfABGwIxAl4BYwKsAT8B8gDKALIArAC0AMcA5QAMATkBbAGmAeIBGgJbAqsC4wJKAvUBwgFsATQBCAHnANQAzADMANIA3gDxAAkBJwFGAWoBkQG1AdUBQQEAQaLQAQtS1QetMTlPYHqKjfiymeGA9v//AABpIcFbv4zXtA/Rx9wP57n6//8EAAAAAAAAAEIBpwDHAKQA7wCyAJ0A5wAwAbwAiQCZAKsAzAAdASkB7QBmAQBBgtEBC0Dsf///AAAhJabb//8AAP0PzH0Y8f//AADtCE8/br7A9///AACtBuYkGn3I2YT5//8AAFcGShtVVUWxC+e6+v//AEHS0QELZrN///8AAO4xEM7//wAA7xKZf+Pt//8AAMQJmUN1u4n3//8AADMHWSijfonYFfv//wAAzQWWG9lTlqnH5m/8//8AAAAA6RLNOTd8A8J97/////8AAAAAAABgH79UdqD92////////wBBwtIBC64BZ3///wAAbzjgxv//AACdGEt/4ef//wAA3gvQSNm2hPX//wAA0gYcKf1+6dcW+///AADSBNgYC1PAqgPpJf3//wAA/ANtEc42Hn4xyNDxTP7//wAAUwNrDRYnyVpdn5TYIfbk/v//AAAAABsI4RvfQgt7hrdj5ej5/////wAAAAAAAOwONC3+WZ2TAcs77////////wAAAAAAAAAA4hq8Qex2LK8V4P//////////AEH60wELwgJtJ7NZe5ea1P////////////8AAAAAAABEfv//AADgO2HB//8AADIdWH5j4v//AABoD/pLNLGx8f//AAAiCbIts36b0vb4//8AAOIFohsSVdyn7eVO/P//AAADBIoRLzgIfiTHEPET/v//AAD4As4L4CXgWvmhddsV9+P+//8AAEMC0AjZGhVBz3x6vAvoxvpQ////AADQAfcGPRTtL7dexZvy0D7wT/yC////AABuATQFKA85JJlIDn1os1PdmPSD/cv///8AAB4BKQQRDDkbRDcbYYKVG8bG5tj3Q/7J////AAAAAOIB2ge2FKgoLErqd3Kq2dOc7Xf6CP//////AAAAAAAA7gPLDbEe8DnfX7CNu7kz3nfz6vz///////8AAAAAAAAAAEcHVhPqKVRL1XKmoW/Ma+la+f//////////AEHG1gELGtEJehyXONNe8ImgtCHaN/L/////////////AEHs1gELGhYOZSVMSftvHJ1ayBTq////////////////AEGU1wELQQ8TIzNQW92M88Cz5///////////////////AAAAAAAAAwAHAAwAEgAZACEAKgA0AD8ASwBYAGYAdQCFAJYAqAC7AEHg1wELhg3Qk1CQm43oiZuHr4rhhviF4IQrupGvB6YrnamWPp3bk3uR846SqVmsd6gSoL2X8Z1slaOTHY8X507ZXsrJu+yvIL1Rq7amuqC8NAAAjDwAAFxEAAAAAAAALEwAAPxMAADyTAAA6EwAAN5MAADeTAAAAE0AAPZMAADsTAAA4kwAAOJMAAC4fpp5mnlmZrh+M3NOU3QzX18yMTJiYXNpY19zdHJpbmdJaE5TXzExY2hhcl90cmFpdHNJaEVFTlNfOWFsbG9jYXRvckloRUVFRQAARHEAAHBsAABOU3QzX18yMTJiYXNpY19zdHJpbmdJd05TXzExY2hhcl90cmFpdHNJd0VFTlNfOWFsbG9jYXRvckl3RUVFRQAARHEAALhsAABOU3QzX18yMTJiYXNpY19zdHJpbmdJRHNOU18xMWNoYXJfdHJhaXRzSURzRUVOU185YWxsb2NhdG9ySURzRUVFRQAAAERxAAAAbQAATlN0M19fMjEyYmFzaWNfc3RyaW5nSURpTlNfMTFjaGFyX3RyYWl0c0lEaUVFTlNfOWFsbG9jYXRvcklEaUVFRUUAAABEcQAATG0AAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWNFRQAARHEAAJhtAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lhRUUAAERxAADAbQAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJc0VFAABEcQAA6G0AAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SXRFRQAARHEAABBuAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lpRUUAAERxAAA4bgAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJakVFAABEcQAAYG4AAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWxFRQAARHEAAIhuAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0ltRUUAAERxAACwbgAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJeEVFAABEcQAA2G4AAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SXlFRQAARHEAAABvAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lmRUUAAERxAAAobwAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJZEVFAABEcQAAUG8AAE4xMF9fY3h4YWJpdjExNl9fc2hpbV90eXBlX2luZm9FAAAAAGxxAAB4bwAAYHIAAE4xMF9fY3h4YWJpdjExN19fY2xhc3NfdHlwZV9pbmZvRQAAAGxxAACobwAAnG8AAE4xMF9fY3h4YWJpdjExN19fcGJhc2VfdHlwZV9pbmZvRQAAAGxxAADYbwAAnG8AAE4xMF9fY3h4YWJpdjExOV9fcG9pbnRlcl90eXBlX2luZm9FAGxxAAAIcAAA/G8AAAAAAAB8cAAAEQAAABIAAAATAAAAFAAAABUAAABOMTBfX2N4eGFiaXYxMjNfX2Z1bmRhbWVudGFsX3R5cGVfaW5mb0UAbHEAAFRwAACcbwAAdgAAAEBwAACIcAAAYgAAAEBwAACUcAAAYwAAAEBwAACgcAAAaAAAAEBwAACscAAAYQAAAEBwAAC4cAAAcwAAAEBwAADEcAAAdAAAAEBwAADQcAAAaQAAAEBwAADccAAAagAAAEBwAADocAAAbAAAAEBwAAD0cAAAbQAAAEBwAAAAcQAAeAAAAEBwAAAMcQAAeQAAAEBwAAAYcQAAZgAAAEBwAAAkcQAAZAAAAEBwAAAwcQAAAAAAAMxvAAARAAAAFgAAABMAAAAUAAAAFwAAABgAAAAZAAAAGgAAAAAAAAC0cQAAEQAAABsAAAATAAAAFAAAABcAAAAcAAAAHQAAAB4AAABOMTBfX2N4eGFiaXYxMjBfX3NpX2NsYXNzX3R5cGVfaW5mb0UAAAAAbHEAAIxxAADMbwAAAAAAAORxAAAfAAAAIAAAACEAAABTdDlleGNlcHRpb24AAAAARHEAANRxAAAAAAAAEHIAAAUAAAAiAAAAIwAAAFN0MTFsb2dpY19lcnJvcgBscQAAAHIAAORxAAAAAAAARHIAAAUAAAAkAAAAIwAAAFN0MTJsZW5ndGhfZXJyb3IAAAAAbHEAADByAAAQcgAAU3Q5dHlwZV9pbmZvAAAAAERxAABQcgBB6OQBCwNAdQE=", import.meta.url).href;
    function ve(y) {
      if (y == yA && s)
        return new Uint8Array(s);
      if (o)
        return o(y);
      throw "both async and sync fetching of the wasm failed";
    }
    function Oe(y) {
      if (!s && (n || I)) {
        if (typeof fetch == "function" && !ce(y))
          return fetch(y, { credentials: "same-origin" }).then((p) => {
            if (!p.ok)
              throw `failed to load wasm binary file at '${y}'`;
            return p.arrayBuffer();
          }).catch(() => ve(y));
        if (E)
          return new Promise((p, G) => {
            E(y, (b) => p(new Uint8Array(b)), G);
          });
      }
      return Promise.resolve().then(() => ve(y));
    }
    function R(y, p, G) {
      return Oe(y).then((b) => WebAssembly.instantiate(b, p)).then(G, (b) => {
        C(`failed to asynchronously prepare wasm: ${b}`), _A(b);
      });
    }
    function F(y, p) {
      var G = yA;
      return s || typeof WebAssembly.instantiateStreaming != "function" || pe(G) || ce(G) || r || typeof fetch != "function" ? R(G, y, p) : fetch(G, { credentials: "same-origin" }).then((b) => WebAssembly.instantiateStreaming(b, y).then(p, function(L) {
        return C(`wasm streaming compile failed: ${L}`), C("falling back to ArrayBuffer instantiation"), R(G, y, p);
      }));
    }
    var Y = (y) => {
      for (; 0 < y.length; )
        y.shift()(A);
    };
    class P {
      constructor(p) {
        this.C = p - 24;
      }
    }
    var j = 0, D, w = (y) => {
      for (var p = ""; d[y]; )
        p += D[d[y++]];
      return p;
    }, S = {}, U = {}, X = {}, k, iA = (y) => {
      throw new k(y);
    }, kA, He = (y, p) => {
      function G(K) {
        if (K = p(K), K.length !== b.length)
          throw new kA("Mismatched type converter count");
        for (var T = 0; T < b.length; ++T)
          mA(b[T], K[T]);
      }
      var b = [];
      b.forEach(function(K) {
        X[K] = y;
      });
      var L = Array(y.length), J = [], q = 0;
      y.forEach((K, T) => {
        U.hasOwnProperty(K) ? L[T] = U[K] : (J.push(K), S.hasOwnProperty(K) || (S[K] = []), S[K].push(() => {
          L[T] = U[K], ++q, q === J.length && G(L);
        }));
      }), J.length === 0 && G(L);
    };
    function _e(y, p, G = {}) {
      var b = p.name;
      if (!y)
        throw new k(`type "${b}" must have a positive integer typeid pointer`);
      if (U.hasOwnProperty(y)) {
        if (G.F)
          return;
        throw new k(`Cannot register type '${b}' twice`);
      }
      U[y] = p, delete X[y], S.hasOwnProperty(y) && (p = S[y], delete S[y], p.forEach((L) => L()));
    }
    function mA(y, p, G = {}) {
      if (!("argPackAdvance" in p))
        throw new TypeError("registerType registeredInstance requires argPackAdvance");
      return _e(y, p, G);
    }
    var nt = [], GA = [], je = (y) => {
      9 < y && --GA[y + 1] === 0 && (GA[y] = void 0, nt.push(y));
    }, $e = (y) => {
      if (!y)
        throw new k("Cannot use deleted val. handle = " + y);
      return GA[y];
    }, me = (y) => {
      switch (y) {
        case void 0:
          return 2;
        case null:
          return 4;
        case !0:
          return 6;
        case !1:
          return 8;
        default:
          let p = nt.pop() || GA.length;
          return GA[p] = y, GA[p + 1] = 1, p;
      }
    };
    function fe(y) {
      return this.fromWireType(N[y >> 2]);
    }
    var Ye = { name: "emscripten::val", fromWireType: (y) => {
      var p = $e(y);
      return je(y), p;
    }, toWireType: (y, p) => me(p), argPackAdvance: 8, readValueFromPointer: fe, B: null }, KQ = (y, p) => {
      switch (p) {
        case 4:
          return function(G) {
            return this.fromWireType(M[G >> 2]);
          };
        case 8:
          return function(G) {
            return this.fromWireType(Z[G >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${p}): ${y}`);
      }
    }, Jt = (y, p) => Object.defineProperty(p, "name", { value: y }), oI = (y) => {
      for (; y.length; ) {
        var p = y.pop();
        y.pop()(p);
      }
    };
    function aI(y) {
      for (var p = 1; p < y.length; ++p)
        if (y[p] !== null && y[p].B === void 0)
          return !0;
      return !1;
    }
    function sI(y) {
      var p = Function;
      if (!(p instanceof Function))
        throw new TypeError(`new_ called with constructor type ${typeof p} which is not a function`);
      var G = Jt(p.name || "unknownFunctionName", function() {
      });
      return G.prototype = p.prototype, G = new G(), y = p.apply(G, y), y instanceof Object ? y : G;
    }
    for (var JQ = (y, p) => {
      if (A[y].A === void 0) {
        var G = A[y];
        A[y] = function(...b) {
          if (!A[y].A.hasOwnProperty(b.length))
            throw new k(`Function '${p}' called with an invalid number of arguments (${b.length}) - expects one of (${A[y].A})!`);
          return A[y].A[b.length].apply(this, b);
        }, A[y].A = [], A[y].A[G.D] = G;
      }
    }, WQ = (y, p, G) => {
      if (A.hasOwnProperty(y)) {
        if (G === void 0 || A[y].A !== void 0 && A[y].A[G] !== void 0)
          throw new k(`Cannot register public name '${y}' twice`);
        if (JQ(y, y), A.hasOwnProperty(G))
          throw new k(`Cannot register multiple overloads of a function with the same number of arguments (${G})!`);
        A[y].A[G] = p;
      } else
        A[y] = p, G !== void 0 && (A[y].H = G);
    }, qQ = (y, p) => {
      for (var G = [], b = 0; b < y; b++)
        G.push(N[p + 4 * b >> 2]);
      return G;
    }, Wt = [], CI, cI = (y) => {
      var p = Wt[y];
      return p || (y >= Wt.length && (Wt.length = y + 1), Wt[y] = p = CI.get(y)), p;
    }, ZQ = (y, p, G = []) => y.includes("j") ? (0, A["dynCall_" + y])(p, ...G) : cI(p)(...G), VQ = (y, p) => (...G) => ZQ(y, p, G), TQ = (y, p) => {
      y = w(y);
      var G = y.includes("j") ? VQ(y, p) : cI(p);
      if (typeof G != "function")
        throw new k(`unknown function pointer with signature ${y}: ${p}`);
      return G;
    }, fI, uI = (y) => {
      y = wI(y);
      var p = w(y);
      return Ge(y), p;
    }, PQ = (y, p) => {
      function G(J) {
        L[J] || U[J] || (X[J] ? X[J].forEach(G) : (b.push(J), L[J] = !0));
      }
      var b = [], L = {};
      throw p.forEach(G), new fI(`${y}: ` + b.map(uI).join([", "]));
    }, XQ = (y) => {
      y = y.trim();
      let p = y.indexOf("(");
      return p !== -1 ? y.substr(0, p) : y;
    }, zQ = (y, p, G) => {
      switch (p) {
        case 1:
          return G ? (b) => x[b] : (b) => d[b];
        case 2:
          return G ? (b) => m[b >> 1] : (b) => H[b >> 1];
        case 4:
          return G ? (b) => v[b >> 2] : (b) => N[b >> 2];
        default:
          throw new TypeError(`invalid integer width (${p}): ${y}`);
      }
    }, xI = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0, hI = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, OQ = (y, p) => {
      for (var G = y >> 1, b = G + p / 2; !(G >= b) && H[G]; )
        ++G;
      if (G <<= 1, 32 < G - y && hI)
        return hI.decode(d.subarray(y, G));
      for (G = "", b = 0; !(b >= p / 2); ++b) {
        var L = m[y + 2 * b >> 1];
        if (L == 0)
          break;
        G += String.fromCharCode(L);
      }
      return G;
    }, _Q = (y, p, G) => {
      if (G ?? (G = 2147483647), 2 > G)
        return 0;
      G -= 2;
      var b = p;
      G = G < 2 * y.length ? G / 2 : y.length;
      for (var L = 0; L < G; ++L)
        m[p >> 1] = y.charCodeAt(L), p += 2;
      return m[p >> 1] = 0, p - b;
    }, jQ = (y) => 2 * y.length, $Q = (y, p) => {
      for (var G = 0, b = ""; !(G >= p / 4); ) {
        var L = v[y + 4 * G >> 2];
        if (L == 0)
          break;
        ++G, 65536 <= L ? (L -= 65536, b += String.fromCharCode(55296 | L >> 10, 56320 | L & 1023)) : b += String.fromCharCode(L);
      }
      return b;
    }, Ao = (y, p, G) => {
      if (G ?? (G = 2147483647), 4 > G)
        return 0;
      var b = p;
      G = b + G - 4;
      for (var L = 0; L < y.length; ++L) {
        var J = y.charCodeAt(L);
        if (55296 <= J && 57343 >= J) {
          var q = y.charCodeAt(++L);
          J = 65536 + ((J & 1023) << 10) | q & 1023;
        }
        if (v[p >> 2] = J, p += 4, p + 4 > G)
          break;
      }
      return v[p >> 2] = 0, p - b;
    }, eo = (y) => {
      for (var p = 0, G = 0; G < y.length; ++G) {
        var b = y.charCodeAt(G);
        55296 <= b && 57343 >= b && ++G, p += 4;
      }
      return p;
    }, HB = [], to = (y) => {
      var p = HB.length;
      return HB.push(y), p;
    }, dI = (y, p) => {
      var G = U[y];
      if (G === void 0)
        throw y = `${p} has unknown type ${uI(y)}`, new k(y);
      return G;
    }, io = (y, p) => {
      for (var G = Array(y), b = 0; b < y; ++b)
        G[b] = dI(N[p + 4 * b >> 2], "parameter " + b);
      return G;
    }, Bo = (y, p, G) => {
      var b = [];
      return y = y.toWireType(b, G), b.length && (N[p >> 2] = me(b)), y;
    }, lI = Array(256), qt = 0; 256 > qt; ++qt)
      lI[qt] = String.fromCharCode(qt);
    D = lI, k = A.BindingError = class extends Error {
      constructor(y) {
        super(y), this.name = "BindingError";
      }
    }, kA = A.InternalError = class extends Error {
      constructor(y) {
        super(y), this.name = "InternalError";
      }
    }, GA.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), A.count_emval_handles = () => GA.length / 2 - 5 - nt.length, fI = A.UnboundTypeError = ((y, p) => {
      var G = Jt(p, function(b) {
        this.name = p, this.message = b, b = Error(b).stack, b !== void 0 && (this.stack = this.toString() + `
` + b.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return G.prototype = Object.create(y.prototype), G.prototype.constructor = G, G.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, G;
    })(Error, "UnboundTypeError");
    var go = { k: (y, p, G) => {
      var b = new P(y);
      throw N[b.C + 16 >> 2] = 0, N[b.C + 4 >> 2] = p, N[b.C + 8 >> 2] = G, j = y, j;
    }, o: () => {
    }, i: (y, p, G, b) => {
      p = w(p), mA(y, { name: p, fromWireType: function(L) {
        return !!L;
      }, toWireType: function(L, J) {
        return J ? G : b;
      }, argPackAdvance: 8, readValueFromPointer: function(L) {
        return this.fromWireType(d[L]);
      }, B: null });
    }, s: (y) => mA(y, Ye), h: (y, p, G) => {
      p = w(p), mA(y, { name: p, fromWireType: (b) => b, toWireType: (b, L) => L, argPackAdvance: 8, readValueFromPointer: KQ(p, G), B: null });
    }, d: (y, p, G, b, L, J, q) => {
      var K = qQ(p, G);
      y = w(y), y = XQ(y), L = TQ(b, L), WQ(y, function() {
        PQ(`Cannot call ${y} due to unbound types`, K);
      }, p - 1), He(K, (T) => {
        var W = [T[0], null].concat(T.slice(1));
        T = y;
        var z = y, QA = L, $ = W.length;
        if (2 > $)
          throw new k("argTypes array size mismatch! Must at least get return value and 'this' types!");
        var KA = W[1] !== null && !1, Me = aI(W), jA = W[0].name !== "void";
        QA = [z, iA, QA, J, oI, W[0], W[1]];
        for (var FA = 0; FA < $ - 2; ++FA)
          QA.push(W[FA + 2]);
        if (!Me)
          for (FA = KA ? 1 : 2; FA < W.length; ++FA)
            W[FA].B !== null && QA.push(W[FA].B);
        Me = aI(W), FA = W.length;
        var $A = "", It = "";
        for ($ = 0; $ < FA - 2; ++$)
          $A += ($ !== 0 ? ", " : "") + "arg" + $, It += ($ !== 0 ? ", " : "") + "arg" + $ + "Wired";
        $A = `
        return function (${$A}) {
        if (arguments.length !== ${FA - 2}) {
          throwBindingError('function ' + humanName + ' called with ' + arguments.length + ' arguments, expected ${FA - 2}');
        }`, Me && ($A += `var destructors = [];
`);
        var DI = Me ? "destructors" : "null", LB = "humanName throwBindingError invoker fn runDestructors retType classParam".split(" ");
        for (KA && ($A += "var thisWired = classParam['toWireType'](" + DI + `, this);
`), $ = 0; $ < FA - 2; ++$)
          $A += "var arg" + $ + "Wired = argType" + $ + "['toWireType'](" + DI + ", arg" + $ + `);
`, LB.push("argType" + $);
        if (KA && (It = "thisWired" + (0 < It.length ? ", " : "") + It), $A += (jA || q ? "var rv = " : "") + "invoker(fn" + (0 < It.length ? ", " : "") + It + `);
`, Me)
          $A += `runDestructors(destructors);
`;
        else
          for ($ = KA ? 1 : 2; $ < W.length; ++$)
            KA = $ === 1 ? "thisWired" : "arg" + ($ - 2) + "Wired", W[$].B !== null && ($A += `${KA}_dtor(${KA});
`, LB.push(`${KA}_dtor`));
        jA && ($A += `var ret = retType['fromWireType'](rv);
return ret;
`);
        let [pI, no] = [LB, $A + `}
`];
        if (pI.push(no), W = sI(pI)(...QA), z = Jt(z, W), W = p - 1, !A.hasOwnProperty(T))
          throw new kA("Replacing nonexistent public symbol");
        return A[T].A !== void 0 && W !== void 0 ? A[T].A[W] = z : (A[T] = z, A[T].D = W), [];
      });
    }, b: (y, p, G, b, L) => {
      if (p = w(p), L === -1 && (L = 4294967295), L = (K) => K, b === 0) {
        var J = 32 - 8 * G;
        L = (K) => K << J >>> J;
      }
      var q = p.includes("unsigned") ? function(K, T) {
        return T >>> 0;
      } : function(K, T) {
        return T;
      };
      mA(y, { name: p, fromWireType: L, toWireType: q, argPackAdvance: 8, readValueFromPointer: zQ(p, G, b !== 0), B: null });
    }, a: (y, p, G) => {
      function b(J) {
        return new L(x.buffer, N[J + 4 >> 2], N[J >> 2]);
      }
      var L = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array][p];
      G = w(G), mA(y, { name: G, fromWireType: b, argPackAdvance: 8, readValueFromPointer: b }, { F: !0 });
    }, g: (y, p) => {
      p = w(p);
      var G = p === "std::string";
      mA(y, { name: p, fromWireType: function(b) {
        var L = N[b >> 2], J = b + 4;
        if (G)
          for (var q = J, K = 0; K <= L; ++K) {
            var T = J + K;
            if (K == L || d[T] == 0) {
              if (q) {
                var W = q, z = d, QA = W + (T - q);
                for (q = W; z[q] && !(q >= QA); )
                  ++q;
                if (16 < q - W && z.buffer && xI)
                  W = xI.decode(z.subarray(W, q));
                else {
                  for (QA = ""; W < q; ) {
                    var $ = z[W++];
                    if ($ & 128) {
                      var KA = z[W++] & 63;
                      if (($ & 224) == 192)
                        QA += String.fromCharCode(($ & 31) << 6 | KA);
                      else {
                        var Me = z[W++] & 63;
                        $ = ($ & 240) == 224 ? ($ & 15) << 12 | KA << 6 | Me : ($ & 7) << 18 | KA << 12 | Me << 6 | z[W++] & 63, 65536 > $ ? QA += String.fromCharCode($) : ($ -= 65536, QA += String.fromCharCode(55296 | $ >> 10, 56320 | $ & 1023));
                      }
                    } else
                      QA += String.fromCharCode($);
                  }
                  W = QA;
                }
              } else
                W = "";
              if (jA === void 0)
                var jA = W;
              else
                jA += "\0", jA += W;
              q = T + 1;
            }
          }
        else {
          for (jA = Array(L), K = 0; K < L; ++K)
            jA[K] = String.fromCharCode(d[J + K]);
          jA = jA.join("");
        }
        return Ge(b), jA;
      }, toWireType: function(b, L) {
        L instanceof ArrayBuffer && (L = new Uint8Array(L));
        var J, q = typeof L == "string";
        if (!(q || L instanceof Uint8Array || L instanceof Uint8ClampedArray || L instanceof Int8Array))
          throw new k("Cannot pass non-string to std::string");
        var K;
        if (G && q)
          for (J = K = 0; J < L.length; ++J) {
            var T = L.charCodeAt(J);
            127 >= T ? K++ : 2047 >= T ? K += 2 : 55296 <= T && 57343 >= T ? (K += 4, ++J) : K += 3;
          }
        else
          K = L.length;
        if (J = K, K = YB(4 + J + 1), T = K + 4, N[K >> 2] = J, G && q) {
          if (q = T, T = J + 1, J = d, 0 < T) {
            T = q + T - 1;
            for (var W = 0; W < L.length; ++W) {
              var z = L.charCodeAt(W);
              if (55296 <= z && 57343 >= z) {
                var QA = L.charCodeAt(++W);
                z = 65536 + ((z & 1023) << 10) | QA & 1023;
              }
              if (127 >= z) {
                if (q >= T)
                  break;
                J[q++] = z;
              } else {
                if (2047 >= z) {
                  if (q + 1 >= T)
                    break;
                  J[q++] = 192 | z >> 6;
                } else {
                  if (65535 >= z) {
                    if (q + 2 >= T)
                      break;
                    J[q++] = 224 | z >> 12;
                  } else {
                    if (q + 3 >= T)
                      break;
                    J[q++] = 240 | z >> 18, J[q++] = 128 | z >> 12 & 63;
                  }
                  J[q++] = 128 | z >> 6 & 63;
                }
                J[q++] = 128 | z & 63;
              }
            }
            J[q] = 0;
          }
        } else if (q)
          for (q = 0; q < J; ++q) {
            if (W = L.charCodeAt(q), 255 < W)
              throw Ge(T), new k("String has UTF-16 code units that do not fit in 8 bits");
            d[T + q] = W;
          }
        else
          for (q = 0; q < J; ++q)
            d[T + q] = L[q];
        return b !== null && b.push(Ge, K), K;
      }, argPackAdvance: 8, readValueFromPointer: fe, B(b) {
        Ge(b);
      } });
    }, e: (y, p, G) => {
      if (G = w(G), p === 2)
        var b = OQ, L = _Q, J = jQ, q = (K) => H[K >> 1];
      else
        p === 4 && (b = $Q, L = Ao, J = eo, q = (K) => N[K >> 2]);
      mA(y, { name: G, fromWireType: (K) => {
        for (var T = N[K >> 2], W, z = K + 4, QA = 0; QA <= T; ++QA) {
          var $ = K + 4 + QA * p;
          (QA == T || q($) == 0) && (z = b(z, $ - z), W === void 0 ? W = z : (W += "\0", W += z), z = $ + p);
        }
        return Ge(K), W;
      }, toWireType: (K, T) => {
        if (typeof T != "string")
          throw new k(`Cannot pass non-string to C++ string type ${G}`);
        var W = J(T), z = YB(4 + W + p);
        return N[z >> 2] = W / p, L(T, z + 4, W + p), K !== null && K.push(Ge, z), z;
      }, argPackAdvance: 8, readValueFromPointer: fe, B(K) {
        Ge(K);
      } });
    }, j: (y, p) => {
      p = w(p), mA(y, { G: !0, name: p, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: () => {
      } });
    }, m: (y, p, G, b) => (y = HB[y], p = $e(p), y(null, p, G, b)), c: je, n: (y, p, G) => {
      p = io(y, p);
      var b = p.shift();
      y--;
      var L = `return function (obj, func, destructorsRef, args) {
`, J = 0, q = [];
      G === 0 && q.push("obj");
      for (var K = ["retType"], T = [b], W = 0; W < y; ++W)
        q.push("arg" + W), K.push("argType" + W), T.push(p[W]), L += `  var arg${W} = argType${W}.readValueFromPointer(args${J ? "+" + J : ""});
`, J += p[W].argPackAdvance;
      return L += `  var rv = ${G === 1 ? "new func" : "func.call"}(${q.join(", ")});
`, b.G || (K.push("emval_returnValue"), T.push(Bo), L += `  return emval_returnValue(retType, destructorsRef, rv);
`), K.push(L + `};
`), y = sI(K)(...T), G = `methodCaller<(${p.map((z) => z.name).join(", ")}) => ${b.name}>`, to(Jt(G, y));
    }, f: (y) => {
      9 < y && (GA[y + 1] += 1);
    }, l: (y) => {
      var p = $e(y);
      oI(p), je(y);
    }, t: (y, p) => (y = dI(y, "_emval_take_value"), y = y.readValueFromPointer(p), me(y)), p: () => {
      _A("");
    }, r: (y, p, G) => d.copyWithin(y, p, p + G), q: (y) => {
      var p = d.length;
      if (y >>>= 0, 2147483648 < y)
        return !1;
      for (var G = 1; 4 >= G; G *= 2) {
        var b = p * (1 + 0.2 / G);
        b = Math.min(b, y + 100663296);
        var L = Math;
        b = Math.max(y, b);
        A: {
          L = (L.min.call(L, 2147483648, b + (65536 - b % 65536) % 65536) - f.buffer.byteLength + 65535) / 65536;
          try {
            f.grow(L), V();
            var J = 1;
            break A;
          } catch {
          }
          J = void 0;
        }
        if (J)
          return !0;
      }
      return !1;
    } }, Le = function() {
      var G;
      function y(b) {
        var L;
        return Le = b.exports, f = Le.u, V(), CI = Le.w, _.unshift(Le.v), sA--, (L = A.monitorRunDependencies) == null || L.call(A, sA), sA == 0 && LA && (b = LA, LA = null, b()), Le;
      }
      var p = { a: go };
      if (sA++, (G = A.monitorRunDependencies) == null || G.call(A, sA), A.instantiateWasm)
        try {
          return A.instantiateWasm(p, y);
        } catch (b) {
          C(`Module.instantiateWasm callback failed with error: ${b}`), B(b);
        }
      return F(p, function(b) {
        y(b.instance);
      }).catch(B), {};
    }(), YB = (y) => (YB = Le.x)(y), Ge = (y) => (Ge = Le.y)(y), wI = (y) => (wI = Le.z)(y), Zt;
    LA = function y() {
      Zt || yI(), Zt || (LA = y);
    };
    function yI() {
      function y() {
        if (!Zt && (Zt = !0, A.calledRun = !0, !h)) {
          if (Y(_), i(A), A.onRuntimeInitialized && A.onRuntimeInitialized(), A.postRun)
            for (typeof A.postRun == "function" && (A.postRun = [A.postRun]); A.postRun.length; ) {
              var p = A.postRun.shift();
              gA.unshift(p);
            }
          Y(gA);
        }
      }
      if (!(0 < sA)) {
        if (A.preRun)
          for (typeof A.preRun == "function" && (A.preRun = [A.preRun]); A.preRun.length; )
            cA();
        Y(EA), 0 < sA || (A.setStatus ? (A.setStatus("Running..."), setTimeout(function() {
          setTimeout(function() {
            A.setStatus("");
          }, 1), y();
        }, 1)) : y());
      }
    }
    if (A.preInit)
      for (typeof A.preInit == "function" && (A.preInit = [A.preInit]); 0 < A.preInit.length; )
        A.preInit.pop()();
    return yI(), t.ready;
  };
})(), M0 = L0;
function pQ(e) {
  try {
    let t = II(e), A = rI(t.get("fmt")), i = t.get("data");
    return mQ(A), GQ(i, A), !0;
  } catch {
    return !1;
  }
}
var k0 = ["int", "float"], K0 = [0, 0, 0, 1];
function J0(e) {
  let t = II(e), A = rI(t.get("fmt")), i = t.get("data"), B = mQ(A), g = K0[B], n = k0[g] + A.bitsPerSample;
  return GQ(i, A), { channelData: q0(i, A, B), sampleRate: A.sampleRate, numberOfChannels: A.numberOfChannels, audioEncoding: g, bitsPerSample: A.bitsPerSample, wavFileTypeName: n };
}
function II(e) {
  let t;
  e instanceof ArrayBuffer ? t = new DataView(e) : t = new DataView(e.buffer, e.byteOffset, e.byteLength);
  let A = t.byteLength;
  if (A < 20)
    throw new Error("WAV file is too short.");
  if (cg(t, 0, 4) != "RIFF")
    throw new Error("Not a valid WAV file (no RIFF header).");
  let i = t.getUint32(4, !0);
  if (8 + i != A)
    throw new Error(`Main chunk length of WAV file (${8 + i}) does not match file size (${A}).`);
  if (cg(t, 8, 4) != "WAVE")
    throw new Error("RIFF file is not a WAV file.");
  let B = /* @__PURE__ */ new Map(), g = 12;
  for (; g < A; ) {
    if (g + 8 > A)
      throw new Error(`Incomplete chunk prefix in WAV file at offset ${g}.`);
    let n = cg(t, g, 4).trim(), I = t.getUint32(g + 4, !0);
    if (g + 8 + I > A)
      throw new Error(`Incomplete chunk data in WAV file at offset ${g}.`);
    let r = new DataView(t.buffer, t.byteOffset + g + 8, I);
    B.set(n, r);
    let a = I % 2;
    g += 8 + I + a;
  }
  return B;
}
function cg(e, t, A) {
  let i = new Uint8Array(e.buffer, e.byteOffset + t, A);
  return String.fromCharCode.apply(null, i);
}
function W0(e, t) {
  let A = e.getInt8(t + 2) * 65536, i = e.getUint16(t, !0);
  return A + i;
}
function rI(e) {
  if (!e)
    throw new Error("No format chunk found in WAV file.");
  if (e.byteLength < 16)
    throw new Error("Format chunk of WAV file is too short.");
  let t = {};
  return t.formatCode = e.getUint16(0, !0), t.numberOfChannels = e.getUint16(2, !0), t.sampleRate = e.getUint32(4, !0), t.bytesPerSec = e.getUint32(8, !0), t.bytesPerFrame = e.getUint16(12, !0), t.bitsPerSample = e.getUint16(14, !0), t;
}
function mQ(e) {
  if (e.numberOfChannels < 1 || e.numberOfChannels > 999)
    throw new Error("Invalid number of channels in WAV file.");
  let t = Math.ceil(e.bitsPerSample / 8), A = e.numberOfChannels * t;
  if (e.formatCode == 1 && e.bitsPerSample >= 1 && e.bitsPerSample <= 8 && e.bytesPerFrame == A)
    return 0;
  if (e.formatCode == 1 && e.bitsPerSample >= 9 && e.bitsPerSample <= 16 && e.bytesPerFrame == A)
    return 1;
  if (e.formatCode == 1 && e.bitsPerSample >= 17 && e.bitsPerSample <= 24 && e.bytesPerFrame == A)
    return 2;
  if (e.formatCode == 3 && e.bitsPerSample == 32 && e.bytesPerFrame == A)
    return 3;
  throw new Error(`Unsupported WAV file type, formatCode=${e.formatCode}, bitsPerSample=${e.bitsPerSample}, bytesPerFrame=${e.bytesPerFrame}, numberOfChannels=${e.numberOfChannels}.`);
}
function q0(e, t, A) {
  switch (A) {
    case 0:
      return V0(e, t);
    case 1:
      return Z0(e, t);
    case 2:
      return T0(e, t);
    case 3:
      return P0(e, t);
    default:
      throw new Error("No decoder.");
  }
}
function Z0(e, t) {
  let A = fB(e.byteLength, t), i = t.numberOfChannels, B = A[0].length, g = 0;
  for (let n = 0; n < B; n++)
    for (let I = 0; I < i; I++) {
      let r = e.getInt16(g, !0) / 32768;
      A[I][n] = r, g += 2;
    }
  return A;
}
function V0(e, t) {
  let A = fB(e.byteLength, t), i = t.numberOfChannels, B = A[0].length, g = 0;
  for (let n = 0; n < B; n++)
    for (let I = 0; I < i; I++) {
      let r = (e.getUint8(g) - 128) / 128;
      A[I][n] = r, g += 1;
    }
  return A;
}
function T0(e, t) {
  let A = fB(e.byteLength, t), i = t.numberOfChannels, B = A[0].length, g = 0;
  for (let n = 0; n < B; n++)
    for (let I = 0; I < i; I++) {
      let r = W0(e, g) / 8388608;
      A[I][n] = r, g += 3;
    }
  return A;
}
function P0(e, t) {
  let A = fB(e.byteLength, t), i = t.numberOfChannels, B = A[0].length, g = 0;
  for (let n = 0; n < B; n++)
    for (let I = 0; I < i; I++) {
      let r = e.getFloat32(g, !0);
      A[I][n] = r, g += 4;
    }
  return A;
}
function fB(e, t) {
  let A = Math.floor(e / t.bytesPerFrame), i = new Array(t.numberOfChannels);
  for (let B = 0; B < t.numberOfChannels; B++)
    i[B] = new Float32Array(A);
  return i;
}
function GQ(e, t) {
  if (!e)
    throw new Error("No data chunk found in WAV file.");
  if (e.byteLength % t.bytesPerFrame != 0)
    throw new Error("WAV file data chunk length is not a multiple of frame size.");
}
function X0(e) {
  let t = II(e), A = z0(t), i = rI(t.get("fmt"));
  return { chunkInfo: A, fmt: i };
}
function z0(e) {
  let t = [];
  for (let A of e) {
    let i = {};
    i.chunkId = A[0], i.dataOffset = A[1].byteOffset, i.dataLength = A[1].byteLength, t.push(i);
  }
  return t.sort((A, i) => A.dataOffset - i.dataOffset), t;
}
function O0(e, t) {
  if (e.length === 0)
    return new Uint8Array();
  if (t === void 0) {
    t = 0;
    for (let B = 0; B < e.length; B++)
      e[B].length && (t += e[B].length);
  }
  let A = new Uint8Array(t), i = 0;
  for (let B = 0; B < e.length; B++) {
    let g = e[B];
    i += _0(g, A, i, 0, g.length);
  }
  return i < t && A.fill(0, i, t), A;
}
function _0(e, t, A, i, B) {
  B - i > t.length - A && (B = i + t.length - A);
  let g = B - i, n = e.length - i;
  return g > n && (g = n), (i !== 0 || B < e.length) && (e = new Uint8Array(e.buffer, e.byteOffset + i, g)), t.set(e, A), g;
}
function j0(e) {
  let { length: t } = e;
  if (t === 1)
    return e[0];
  let A = new Float32Array(e[0].length);
  for (let i = 0; i < A.length; i++) {
    let B = 0;
    for (let g = 0; g < t; g++)
      B += e[g][i];
    A[i] = B / t;
  }
  return A;
}
function $0(e) {
  let t = e.length, A = Math.ceil(16 / 8), i = t * A, B = new ArrayBuffer(i), g = new Int16Array(B);
  for (let n = 0; n < t; n++) {
    let I = e[n], r = AC(I);
    g[n] = r;
  }
  return B;
}
function AC(e) {
  return e *= 32768, e = ~~e, e > 32767 ? 32767 : e;
}
async function eC(e, t) {
  let A = await M0(), i = ArrayBuffer.isView(e) ? e.buffer : e;
  if (pQ(e)) {
    let { channelData: r, sampleRate: a } = J0(e);
    t || (t = a), i = $0(j0(r));
  }
  let B = [], g = 0, n = A.silk_encode(i, i.byteLength, t, (r) => {
    g += r.length, B.push(r.slice());
  });
  if (n === 0)
    throw new Error("silk encoding failure");
  let I = B.pop();
  return I && (B.push(I.slice(0, -1)), g--), { data: O0(B, g), duration: n };
}
function tC(e, t = 20) {
  let A = ArrayBuffer.isView(e) ? e.buffer : e, i = e[0] === 2 ? 10 : 9, B = 0, g = new DataView(A);
  for (; i < g.byteLength; ) {
    let n = g.getUint16(i, !0);
    B += 1, i += n + 2;
  }
  return B * t;
}
function iC(e) {
  return pQ(e);
}
function BC(e) {
  return X0(e);
}
let FQ = "./";
setTimeout(() => {
  FQ = N0();
}, 100);
async function gC(e) {
  function t(B) {
    try {
      return nA.readFileSync(B, {
        encoding: null,
        flag: "r"
      }).toString("hex", 0, 7);
    } catch (n) {
      console.error("读取文件错误:", n);
      return;
    }
  }
  async function A(B) {
    return iC(nA.readFileSync(B));
  }
  async function i(B) {
    let n = (await so.stat(B)).size / 1024 / 3;
    return n = Math.floor(n), n = Math.max(1, n), BA("通过文件大小估算语音的时长:", n), n;
  }
  try {
    const B = rA.join(FQ, S0());
    if (t(e) !== "02232153494c4b") {
      BA(`语音文件${e}需要转换成silk`);
      const g = await A(e), n = B + ".pcm";
      let I = 0;
      const r = () => new Promise((E, o) => {
        const c = process.env.FFMPEG_PATH || "ffmpeg", l = yo(c, ["-y", "-i", e, "-ar", "24000", "-ac", "1", "-f", "s16le", n]);
        l.on("error", (u) => (BA("FFmpeg处理转换出错: ", u.message), o(u))), l.on("exit", (u, C) => {
          const s = [0, 255];
          if (u == null || s.includes(u)) {
            I = 24e3;
            const f = nA.readFileSync(n);
            return nA.unlink(n, (h) => {
            }), E(f);
          }
          BA(`FFmpeg exit: code=${u ?? "unknown"} sig=${C ?? "unknown"}`), o(Error("FFmpeg处理转换失败"));
        });
      });
      let a;
      if (!g)
        a = await r();
      else {
        a = nA.readFileSync(e);
        const E = [8e3, 12e3, 16e3, 24e3, 32e3, 44100, 48e3], { fmt: o } = BC(a);
        E.includes(o.sampleRate) || (a = await r());
      }
      const Q = await eC(a, I);
      return nA.writeFileSync(B, Q.data), BA(`语音文件${e}转换成功!`, B, "时长:", Q.duration), {
        converted: !0,
        path: B,
        duration: Q.duration / 1e3
      };
    } else {
      const g = nA.readFileSync(e);
      let n = 0;
      try {
        n = tC(g) / 1e3;
      } catch (I) {
        BA("获取语音文件时长失败, 使用文件大小推测时长", e, I.stack), n = await i(e);
      }
      return {
        converted: !1,
        path: e,
        duration: n
      };
    }
  } catch (B) {
    return BA("convert silk failed", B.stack), {};
  }
}
const IA = NA;
function NA(e, t) {
  const A = Ui();
  return NA = function(i, B) {
    i = i - 448;
    let g = A[i];
    if (NA.xqwwSM === void 0) {
      var n = function(Q) {
        const E = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
        let o = "", c = "", l = o + n;
        for (let u = 0, C, s, f = 0; s = Q.charAt(f++); ~s && (C = u % 4 ? C * 64 + s : s, u++ % 4) ? o += l.charCodeAt(f + 10) - 10 !== 0 ? String.fromCharCode(255 & C >> (-2 * u & 6)) : u : 0)
          s = E.indexOf(s);
        for (let u = 0, C = o.length; u < C; u++)
          c += "%" + ("00" + o.charCodeAt(u).toString(16)).slice(-2);
        return decodeURIComponent(c);
      };
      NA.PHoaRb = n, e = arguments, NA.xqwwSM = !0;
    }
    const I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      const Q = function(E) {
        this.OXNKjW = E, this.UJfDVk = [1, 0, 0], this.nwYUBv = function() {
          return "newState";
        }, this.xcdxAn = "\\w+ *\\(\\) *{\\w+ *", this.rufgDC = `['|"].+['|"];? *}`;
      };
      Q.prototype.YPpvvd = function() {
        const E = new RegExp(this.xcdxAn + this.rufgDC), o = E.test(this.nwYUBv.toString()) ? --this.UJfDVk[1] : --this.UJfDVk[0];
        return this.INUtTk(o);
      }, Q.prototype.INUtTk = function(E) {
        return ~E ? this.NvNrGs(this.OXNKjW) : E;
      }, Q.prototype.NvNrGs = function(E) {
        for (let o = 0, c = this.UJfDVk.length; o < c; o++)
          this.UJfDVk.push(Math.round(Math.random())), c = this.UJfDVk.length;
        return E(this.UJfDVk[0]);
      }, new Q(NA).YPpvvd(), g = NA.PHoaRb(g), e[r] = g;
    }
    return g;
  }, NA(e, t);
}
(function(e, t) {
  const A = NA, i = e();
  for (; ; )
    try {
      if (-parseInt(A(558)) / 1 * (-parseInt(A(492)) / 2) + -parseInt(A(560)) / 3 * (parseInt(A(453)) / 4) + -parseInt(A(578)) / 5 * (-parseInt(A(580)) / 6) + -parseInt(A(458)) / 7 + -parseInt(A(468)) / 8 * (-parseInt(A(452)) / 9) + -parseInt(A(516)) / 10 + parseInt(A(521)) / 11 * (parseInt(A(550)) / 12) === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(Ui, 283530);
const nC = function() {
  const e = NA, t = { zQCQW: function(i, B) {
    return i(B);
  }, WTyIW: function(i, B) {
    return i !== B;
  }, riGnx: e(470) };
  let A = !0;
  return function(i, B) {
    const g = e, n = { EFcQx: function(r, a) {
      return t[NA(500)](r, a);
    }, NGNGi: function(r, a) {
      return t.WTyIW(r, a);
    }, vnfKm: t[g(533)] }, I = A ? function() {
      const r = g, a = { geBhT: function(Q, E) {
        return n[NA(517)](Q, E);
      } };
      if (n[r(542)](r(470), n.vnfKm))
        _0x3e1ea1.writeFile(_0x48eb09, _0x14afb5)[r(520)](() => {
          a[r(552)](_0x176028, _0x4fc10e);
        })[r(460)](_0x56ed42);
      else if (B) {
        const Q = B[r(469)](i, arguments);
        return B = null, Q;
      }
    } : function() {
    };
    return A = !1, I;
  };
}(), an = nC(void 0, function() {
  const e = NA, t = {};
  t[e(461)] = e(482);
  const A = t;
  return an[e(513)]()[e(561)]("(((.+)+)+)+$")[e(513)]()[e(530)](an).search(A[e(461)]);
});
function Ui() {
  const e = ["mtzWsujlzNy", "yxbWBhK", "vfnQuhe", "zxjYB3i", "CNbZ", "C2vgu2e", "DxbMCeO", "qvjl", "zMLSzvbHDgG", "Bwq1sgv4u3rY", "Dgv4Da", "AgPuAxy", "zgLYBMfTzq", "zwXLBwvUDeLK", "kcGOlISPkYKRksSK", "B0fKwwK", "Bxa0", "yNbhy3O", "CgLJrwXLBwvUDa", "yxruExbL", "zMfJzuvSzw1LBNq", "t3PSAMC", "EKveANi", "Chr0rwXLBwvUDa", "mJK0v2fVrKPk", "seXtDxK", "s2Pqvgq", "EezdzLK", "tufss0rpv04", "zM9YBwf0vhLWzq", "z2zus1O", "t3jP", "ELfduvC", "BKn1re0", "C2L6zq", "rKfdrq", "veHps0q", "5PAh5lU25BYc5BI477Ym5AsN5Bcp5lI6ma", "BM9YBwfS", "BKDUDu4", "uuLMBMW", "D21VCxi", "yxv0B0nVBNzLCNruzxH0", "zhvYyxrPB24", "6kEg6Akr5l+H5OgV", "Dg9tDhjPBMC", "zMLSzvn1yKLK", "Ce1xCey", "ntq4nZiYmgL3EKHRyW", "ruzJuxG", "BxfUtuO", "zMfJzvr5Cgu", "DgHLBG", "mtK5mZK3u1rJAgvi", "ANnTEey", "ALv6qLi", "BM90qxq", "u0jwBLi", "zMfJzvrLEhq", "C0ntDLK", "CgLJ", "qKrWq20", "y29UC3rYDwn0B3i", "DMLKzw8", "rKLmrq", "CMLhBNG", "D3jPDgvgAwXL", "DxbSB2fKrMLSzq", "CMvWBgf5txnNswq", "AgvPz2H0", "yxruAw55swq", "CgfJA0LK", "D2LKDgG", "6i635y+w6kEg6Akr5l+H5OgV5AsX6lsL", "tKDor2K", "Chr0", "t0H4see", "rwryDgK", "xZaUCg5N", "AMDRwge", "w+wmHEwjQUMuPf0", "zMfJzq", "mta4v0PNywfm", "zM9YBwf0", "z2vcAfq", "CgXHEvn0yxrL", "vMPQz3K", "D2f2zufTCgXPDhvKzxm", "yxjR", "zMLSzvnPEMu", "mZe5mvLhvgPQEa", "C291CMnLvhLWzq", "ody1mMv0v1PIqW", "C2vHCMnO", "Dw9js1q", "whbzsLC", "y2fUq29UDMvYDdjuzxH0", "ELnvrLa", "CMvWBhK", "Dgv4DevSzw1LBNq", "yMHnseK", "C2vW", "DM9Py2vdAgfUz2vuExbL", "wMvlCfG", "C1jJq3e", "y29UDgvUDa", "vgH1Bwi", "yxroDfvPza", "zw5K", "zgrKCfu", "mZu1tvHhDurS", "C2v0", "mJy1mdjyCNbAzgG", "t0fqteu", "AgDmt1m", "CMvWBgfJzq", "ueLd", "t0z2wMe", "C3rPy2TLCKLK", "BgLUA0LUzM8", "vevyva", "C3rPy2TLCLr5Cgu", "t0jmsNu", "AM9PBG", "y3vzD0y", "zMLSzu5HBwu", "BNnWq1G", "yxrvAwq", "BvHvEKu", "ufru", "CuLst3u", "qMnPEha", "zMLSzq", "uKvszNK", "yMTpy0e", "zMfJzuLUzgv4", "Du9TvuK", "DgLTzq", "mta5ndKYmMDRqMXpvW", "nde2s21gA1Lv", "yxjRrwXLBwvUDa", "zwXLBwvUDfr5Cgu", "C3vYChjPC2vjza", "vKLeru8", "mZK4nJG1B2D6txfs", "C2nYzwvUC2HVDhm", "y2f0y2G", "zxfwANa", "C3vIrwXLBwvUDfr5Cgu", "BM9YBwfSmG", "y29WEuzPBgu", "BwfYA2rVD25fBgvTzw50", "BwfYA2rVD24", "6i635y+w6kEg6Akr5Bcb6z2I5AsX6lsL77Ym5l2/55sO6BUy6k6K5Bcb6z2I"];
  return Ui = function() {
    return e;
  }, Ui();
}
an();
class IC {
  static [IA(478)](t) {
    const A = IA, i = {};
    i[A(573)] = t, i[A(487)] = Pn[A(524)], i[A(595)] = "", i[A(538)] = "", i[A(575)] = "";
    const B = {};
    return B[A(455)] = oA[A(588)], B.elementId = "", B.textElement = i, B;
  }
  static at(t, A, i, B) {
    const g = IA, n = {};
    n[g(573)] = "@" + B, n.atType = i, n[g(595)] = t, n.atTinyId = "", n[g(575)] = A;
    const I = {};
    return I.elementType = oA.TEXT, I[g(481)] = "", I[g(567)] = n, I;
  }
  static [IA(566)](t, A, i, B) {
    const g = IA, n = {};
    n.replayMsgSeq = t, n[g(536)] = A, n.senderUin = i, n.senderUinStr = B;
    const I = {};
    return I.elementType = oA.REPLY, I.elementId = "", I.replyElement = n, I;
  }
  static async [IA(528)](t, A = "", i = 0) {
    const B = IA, g = { MAxTb: B(505), zSUFP: function(c, l) {
      return c(l);
    }, KSxoX: "图片信息" }, { md5: n, fileName: I, path: r, fileSize: a } = await ye[B(535)](t, oA[B(584)], i);
    if (a === 0)
      throw g.MAxTb;
    const Q = await ye.getImageSize(t), E = { md5HexStr: n, fileSize: a.toString(), picWidth: Q == null ? void 0 : Q.width, picHeight: Q == null ? void 0 : Q[B(537)], fileName: I, sourcePath: r, original: !0, picType: g[B(565)](U0, t) ? Qi.gif : Qi.jpg, picSubType: i, fileUuid: "", fileSubId: "", thumbFileSize: 0, summary: A };
    BA(g.KSxoX, E);
    const o = {};
    return o[B(455)] = oA.PIC, o[B(481)] = "", o[B(486)] = E, o;
  }
  static async [IA(600)](t, A = "") {
    const i = IA, B = {};
    B[i(483)] = function(E, o) {
      return E === o;
    }, B[i(562)] = i(505);
    const g = B, { md5: n, fileName: I, path: r, fileSize: a } = await ye[i(535)](t, oA[i(532)]);
    if (g[i(483)](a, 0))
      throw g.uoIKT;
    return { elementType: oA[i(532)], elementId: "", fileElement: { fileName: A || I, filePath: r, fileSize: a[i(513)]() } };
  }
  static async [IA(531)](t, A = "", i = "") {
    const B = IA, g = { zYPEF: function(x, d) {
      return x(d);
    }, fWqRw: function(x, d) {
      return x === d;
    }, FOxKB: B(596), nGnuN: function(x, d) {
      return x(d);
    }, THOKD: B(498), HLRjo: B(485), sRcCq: function(x, d, m) {
      return x(d, m);
    }, HLSuy: "sDIBP", mqnMJ: function(x, d) {
      return x === d;
    }, dbutS: B(501), SBVnR: function(x, d) {
      return x(d);
    }, hgLOS: function(x, d) {
      return x === d;
    }, bhMHI: B(601), upfpJ: B(471), zEDjr: function(x, d) {
      return x + d;
    }, Bcixp: "end", jUzBR: "path", bkOcA: B(484), OHxHA: function(x, d) {
      return x !== d;
    }, pMWpF: "eYFFj", kuwYO: B(512), jsmxF: function(x, d) {
      return x !== d;
    }, jgkXa: B(450), dddpU: B(541), xIXIf: function(x, d) {
      return x(d);
    }, hjTiv: function(x, d) {
      return x || d;
    } }, { fileName: n, path: I, fileSize: r, md5: a } = await ye[B(535)](t, oA[B(457)]);
    if (g[B(582)](r, 0))
      throw B(505);
    const Q = require(g[B(523)]);
    let E = I[B(583)](Q.sep + B(499) + Q[B(569)], Q.sep + B(574) + Q[B(569)]);
    E = Q[B(480)](E);
    const o = {};
    o.width = 1920, o[B(537)] = 1080, o[B(451)] = 15, o[B(551)] = g[B(448)], o[B(502)] = r, o.filePath = t;
    let c = o;
    try {
      g[B(544)](g[B(515)], g[B(515)]) ? _0x4565c2(_0xc3d3b0) : (c = await g.SBVnR(Y0, I), BA(g.kuwYO, c));
    } catch (x) {
      if (g[B(522)]("uOmUI", g[B(547)])) {
        const d = {};
        d[B(573)] = _0x11fd48;
        const m = {};
        return m.elementType = _0x1e3936[B(496)], m.elementId = "", m[B(465)] = d, m;
      } else
        BA(g[B(577)], x);
    }
    const l = new Promise((x, d) => {
      const m = B, H = {};
      H[m(594)] = "ybgqP";
      const v = H;
      if (g[m(582)](g[m(568)], m(601))) {
        const N = a + m(546), M = Q[m(591)](E, N);
        g[m(507)](In, t).on(m(576), () => {
        }).on(g[m(474)], (Z) => {
          const V = m, EA = { seFSa: function(_, gA) {
            return g.zYPEF(_, gA);
          }, wmoqr: function(_, gA) {
            return g.fWqRw(_, gA);
          }, yNjwV: g.FOxKB, OFvZa: V(494), BDpCm: function(_, gA) {
            return g[V(507)](_, gA);
          } };
          if (g[V(504)] === g.HLRjo)
            throw V(505);
          if (g[V(572)](BA, V(467), Z), i)
            if (g[V(493)] !== g.HLSuy) {
              const _ = { xFCfY: function(gA, cA) {
                return EA[V(473)](gA, cA);
              } };
              _0x33656c[V(464)](_0x582c48, _0x5bb7b6)[V(520)](() => {
                _[V(495)](_0xf644cc, _0x183b3c);
              })[V(460)](_0x48e8ce);
            } else
              Vt.copyFile(i, M)[V(520)](() => {
                const _ = V;
                if (EA[_(509)](EA.yNjwV, EA[_(585)])) {
                  const gA = _0x1340a2 ? function() {
                    if (_0x133a6e) {
                      const cA = _0x27419a.apply(_0x519ae7, arguments);
                      return _0x49564a = null, cA;
                    }
                  } : function() {
                  };
                  return _0x40f5f5 = !1, gA;
                } else
                  EA[_(529)](x, M);
              })[V(460)](d);
          else if (g[V(518)](V(598), g.dbutS)) {
            const _ = {};
            _[V(573)] = _0x277156, _[V(487)] = _0x38582e[V(524)], _.atUid = "", _[V(538)] = "", _[V(575)] = "";
            const gA = {};
            return gA[V(455)] = _0xbe6b94[V(588)], gA[V(481)] = "", gA.textElement = _, gA;
          } else
            Vt[V(534)](M, H0)[V(520)](() => {
              const _ = V;
              if (v[_(594)] !== _(592))
                x(M);
              else {
                const gA = {};
                gA[_(449)] = _0x2ad13b, gA.faceType = _0x2ecdf7 < 222 ? _0x4f8254.normal : _0x23125d[_(463)];
                const cA = {};
                return cA[_(455)] = _0x3bd1a3[_(503)], cA[_(481)] = "", cA[_(488)] = gA, cA;
              }
            })[V(460)](d);
        })[m(459)]({ timestamps: [0], filename: N, folder: E, size: g[m(490)](g[m(490)](c[m(540)], "x"), c.height) }).on(g[m(599)], () => {
          g[m(525)](x, M);
        });
      } else {
        const N = {};
        N[m(573)] = "@" + _0x3249e4, N[m(487)] = _0x52faa6, N[m(595)] = _0xdd0d27, N[m(538)] = "", N[m(575)] = _0x300fd2;
        const M = {};
        return M.elementType = _0x1e19ef.TEXT, M[m(481)] = "", M.textElement = N, M;
      }
    }), u = /* @__PURE__ */ new Map(), C = await l, s = (await Vt.stat(C)).size;
    u[B(579)](0, C);
    const f = await g.xIXIf(DQ, C);
    return { elementType: oA.VIDEO, elementId: "", videoElement: { fileName: g[B(479)](A, n), filePath: I, videoMd5: a, thumbMd5: f, fileTime: c.time, thumbPath: u, thumbSize: s, thumbWidth: c[B(540)], thumbHeight: c[B(537)], fileSize: g[B(490)]("", r) } };
  }
  static async [IA(543)](t) {
    const A = IA, i = { uPcSq: function(c, l, u) {
      return c(l, u);
    }, Ozljg: A(541), XpYJW: "文件异常，大小为0", Vjjgy: function(c, l) {
      return c(l);
    }, OBLJu: function(c, l) {
      return c === l;
    }, OAPLE: A(527) }, { converted: B, path: g, duration: n } = await i[A(554)](gC, t), { md5: I, fileName: r, path: a, fileSize: Q } = await ye[A(535)](g, oA.PTT);
    if (i.OBLJu(Q, 0)) {
      if (i[A(590)]("ZeKpX", A(571)))
        throw i[A(563)];
      i.uPcSq(_0x4dbefb, i[A(489)], _0x53d519);
    }
    if (B) {
      if (i[A(590)]("vUkeV", i[A(581)]))
        throw i[A(563)];
      Vt.unlink(g)[A(520)]();
    }
    const E = {};
    E[A(593)] = r, E[A(476)] = a, E[A(477)] = I, E[A(557)] = Q, E[A(511)] = n || 1, E[A(497)] = 1, E.voiceType = 1, E[A(570)] = 0, E[A(564)] = !0, E[A(555)] = [0, 18, 9, 23, 16, 17, 16, 15, 44, 17, 24, 20, 14, 15, 17], E[A(514)] = "", E[A(553)] = 1, E[A(510)] = 0;
    const o = {};
    return o[A(455)] = oA[A(597)], o.elementId = "", o[A(491)] = E, o;
  }
  static [IA(549)](t) {
    const A = IA, i = {};
    i[A(545)] = function(g, n) {
      return g < n;
    };
    const B = i;
    return { elementType: oA[A(503)], elementId: "", faceElement: { faceIndex: t, faceType: B[A(545)](t, 222) ? pt[A(506)] : pt[A(463)] } };
  }
  static dice(t) {
    const A = IA, i = {};
    i[A(449)] = ai.dice, i[A(519)] = pt.dice, i[A(526)] = "[骰子]", i[A(539)] = "1", i[A(586)] = "33", i[A(559)] = 1, i[A(589)] = 2, i[A(456)] = "";
    const B = {};
    return B[A(455)] = oA[A(503)], B[A(481)] = "", B[A(488)] = i, B;
  }
  static [IA(472)](t) {
    const A = IA, i = {};
    i[A(508)] = A(548);
    const B = i, g = {};
    g[A(449)] = ai.RPS, g[A(526)] = B[A(508)], g[A(519)] = 3, g.packId = "1", g[A(586)] = "34", g[A(559)] = 1, g.stickerType = 2, g[A(456)] = "";
    const n = {};
    return n[A(455)] = oA[A(503)], n[A(481)] = "", n[A(488)] = g, n;
  }
  static [IA(556)](t) {
    const A = IA, i = {};
    i.bytesData = t, i[A(587)] = null, i[A(462)] = null;
    const B = {};
    return B[A(455)] = oA[A(475)], B[A(481)] = "", B[A(454)] = i, B;
  }
  static [IA(466)](t) {
    const A = IA, i = {};
    i[A(573)] = t;
    const B = {};
    return B[A(455)] = oA.MARKDOWN, B[A(481)] = "", B[A(465)] = i, B;
  }
}
function de(e, t) {
  var A = vi();
  return de = function(i, B) {
    i = i - 342;
    var g = A[i];
    if (de.nqocgn === void 0) {
      var n = function(E) {
        for (var o = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=", c = "", l = "", u = c + n, C = 0, s, f, h = 0; f = E.charAt(h++); ~f && (s = C % 4 ? s * 64 + f : f, C++ % 4) ? c += u.charCodeAt(h + 10) - 10 !== 0 ? String.fromCharCode(255 & s >> (-2 * C & 6)) : C : 0)
          f = o.indexOf(f);
        for (var x = 0, d = c.length; x < d; x++)
          l += "%" + ("00" + c.charCodeAt(x).toString(16)).slice(-2);
        return decodeURIComponent(l);
      };
      de.TtuGyJ = n, e = arguments, de.nqocgn = !0;
    }
    var I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      var Q = function(E) {
        this.Arufei = E, this.xYpzik = [1, 0, 0], this.fEqcVY = function() {
          return "newState";
        }, this.JkJYBK = "\\w+ *\\(\\) *{\\w+ *", this.iuLcSs = `['|"].+['|"];? *}`;
      };
      Q.prototype.hHlJVv = function() {
        var E = new RegExp(this.JkJYBK + this.iuLcSs), o = E.test(this.fEqcVY.toString()) ? --this.xYpzik[1] : --this.xYpzik[0];
        return this.xubgNY(o);
      }, Q.prototype.xubgNY = function(E) {
        return ~E ? this.rwvWOY(this.Arufei) : E;
      }, Q.prototype.rwvWOY = function(E) {
        for (var o = 0, c = this.xYpzik.length; o < c; o++)
          this.xYpzik.push(Math.round(Math.random())), c = this.xYpzik.length;
        return E(this.xYpzik[0]);
      }, new Q(de).hHlJVv(), g = de.TtuGyJ(g), e[r] = g;
    }
    return g;
  }, de(e, t);
}
(function(e, t) {
  for (var A = de, i = e(); ; )
    try {
      var B = -parseInt(A(349)) / 1 + parseInt(A(356)) / 2 * (parseInt(A(354)) / 3) + parseInt(A(346)) / 4 * (parseInt(A(345)) / 5) + -parseInt(A(358)) / 6 + parseInt(A(353)) / 7 * (-parseInt(A(343)) / 8) + -parseInt(A(350)) / 9 * (parseInt(A(359)) / 10) + parseInt(A(352)) / 11 * (parseInt(A(357)) / 12);
      if (B === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(vi, 663480);
var rC = /* @__PURE__ */ function() {
  var e = !0;
  return function(t, A) {
    var i = e ? function() {
      var B = de;
      if (A) {
        var g = A[B(351)](t, arguments);
        return A = null, g;
      }
    } : function() {
    };
    return e = !1, i;
  };
}(), sn = rC(void 0, function() {
  var e = de, t = {};
  t[e(355)] = e(347);
  var A = t;
  return sn[e(342)]()[e(344)](e(347))[e(342)]()[e(348)](sn)[e(344)](A.VxQEh);
});
function vi() {
  var e = ["y29UC3rYDwn0B3i", "mtiYmdqWyNbwuw5y", "mJe3mJuXoxziqNbkrq", "yxbWBhK", "odCWodGXtLzcAhLV", "mZvVsLD2vg8", "m0fRvgrtsq", "vNHrrwG", "mta1nJq1mM9Vqujswq", "mJy0BMPSwNzv", "mJm1mZCYmKLQshfXqG", "mZbkwKziEfm", "Dg9tDhjPBMC", "mtu4mdi4ogHdvgfVqG", "C2vHCMnO", "mte2mevlBMrWwG", "mta2odreAvjjBfu", "kcGOlISPkYKRksSK"];
  return vi = function() {
    return e;
  }, vi();
}
sn();
const fu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AtType: Pn,
  CacheFileType: xE,
  ChatType: aE,
  ElementType: oA,
  FaceIndex: ai,
  FaceType: pt,
  GrayTipElementSubType: sE,
  GroupMemberRole: QE,
  GroupNotifyStatus: fE,
  GroupNotifyTypes: cE,
  GroupRequestOperateTypes: uE,
  IMAGE_HTTP_HOST: Uo,
  IMAGE_HTTP_HOST_NT: vo,
  PicSubType: oE,
  PicType: Qi,
  SendMsgElementConstructor: IC,
  Sex: EE,
  TipGroupElementType: CE
}, Symbol.toStringTag, { value: "Module" }));
var Cn = { exports: {} }, EI = { exports: {} }, EC = ht, RQ = Ut.EventEmitter;
EI.exports = YA;
EI.exports.default = YA;
function YA(e) {
  if (!(this instanceof YA))
    return new YA(e);
  RQ.call(this), e = e || {}, this.concurrency = e.concurrency || 1 / 0, this.timeout = e.timeout || 0, this.autostart = e.autostart || !1, this.results = e.results || null, this.pending = 0, this.session = 0, this.running = !1, this.jobs = [], this.timers = {};
}
EC(YA, RQ);
var QC = [
  "pop",
  "shift",
  "indexOf",
  "lastIndexOf"
];
QC.forEach(function(e) {
  YA.prototype[e] = function() {
    return Array.prototype[e].apply(this.jobs, arguments);
  };
});
YA.prototype.slice = function(e, t) {
  return this.jobs = this.jobs.slice(e, t), this;
};
YA.prototype.reverse = function() {
  return this.jobs.reverse(), this;
};
var oC = [
  "push",
  "unshift",
  "splice"
];
oC.forEach(function(e) {
  YA.prototype[e] = function() {
    var t = Array.prototype[e].apply(this.jobs, arguments);
    return this.autostart && this.start(), t;
  };
});
Object.defineProperty(YA.prototype, "length", {
  get: function() {
    return this.pending + this.jobs.length;
  }
});
YA.prototype.start = function(e) {
  if (e && sC.call(this, e), this.running = !0, this.pending >= this.concurrency)
    return;
  if (this.jobs.length === 0) {
    this.pending === 0 && cn.call(this);
    return;
  }
  var t = this, A = this.jobs.shift(), i = !0, B = this.session, g = null, n = !1, I = null, r = A.hasOwnProperty("timeout") ? A.timeout : this.timeout;
  function a(E, o) {
    i && t.session === B && (i = !1, t.pending--, g !== null && (delete t.timers[g], clearTimeout(g)), E ? t.emit("error", E, A) : n === !1 && (I !== null && (t.results[I] = Array.prototype.slice.call(arguments, 1)), t.emit("success", o, A)), t.session === B && (t.pending === 0 && t.jobs.length === 0 ? cn.call(t) : t.running && t.start()));
  }
  r && (g = setTimeout(function() {
    n = !0, t.listeners("timeout").length > 0 ? t.emit("timeout", a, A) : a();
  }, r), this.timers[g] = g), this.results && (I = this.results.length, this.results[I] = null), this.pending++, t.emit("start", A);
  var Q = A(a);
  Q && Q.then && typeof Q.then == "function" && Q.then(function(E) {
    return a(null, E);
  }).catch(function(E) {
    return a(E || !0);
  }), this.running && this.jobs.length > 0 && this.start();
};
YA.prototype.stop = function() {
  this.running = !1;
};
YA.prototype.end = function(e) {
  aC.call(this), this.jobs.length = 0, this.pending = 0, cn.call(this, e);
};
function aC() {
  for (var e in this.timers) {
    var t = this.timers[e];
    delete this.timers[e], clearTimeout(t);
  }
}
function sC(e) {
  var t = this;
  this.on("error", A), this.on("end", i);
  function A(B) {
    t.end(B);
  }
  function i(B) {
    t.removeListener("error", A), t.removeListener("end", i), e(B, this.results);
  }
}
function cn(e) {
  this.session++, this.running = !1, this.emit("end", e);
}
var CC = EI.exports, Mt = {}, uB = {}, aA = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.findBox = e.readUInt = e.readUInt32LE = e.readUInt32BE = e.readInt32LE = e.readUInt24LE = e.readUInt16LE = e.readUInt16BE = e.readInt16LE = e.toHexString = e.toUTF8String = void 0;
  const t = new TextDecoder(), A = (u, C = 0, s = u.length) => t.decode(u.slice(C, s));
  e.toUTF8String = A;
  const i = (u, C = 0, s = u.length) => u.slice(C, s).reduce((f, h) => f + ("0" + h.toString(16)).slice(-2), "");
  e.toHexString = i;
  const B = (u, C = 0) => {
    const s = u[C] + u[C + 1] * 256;
    return s | (s & 2 ** 15) * 131070;
  };
  e.readInt16LE = B;
  const g = (u, C = 0) => u[C] * 2 ** 8 + u[C + 1];
  e.readUInt16BE = g;
  const n = (u, C = 0) => u[C] + u[C + 1] * 2 ** 8;
  e.readUInt16LE = n;
  const I = (u, C = 0) => u[C] + u[C + 1] * 2 ** 8 + u[C + 2] * 2 ** 16;
  e.readUInt24LE = I;
  const r = (u, C = 0) => u[C] + u[C + 1] * 2 ** 8 + u[C + 2] * 2 ** 16 + (u[C + 3] << 24);
  e.readInt32LE = r;
  const a = (u, C = 0) => u[C] * 2 ** 24 + u[C + 1] * 2 ** 16 + u[C + 2] * 2 ** 8 + u[C + 3];
  e.readUInt32BE = a;
  const Q = (u, C = 0) => u[C] + u[C + 1] * 2 ** 8 + u[C + 2] * 2 ** 16 + u[C + 3] * 2 ** 24;
  e.readUInt32LE = Q;
  const E = {
    readUInt16BE: e.readUInt16BE,
    readUInt16LE: e.readUInt16LE,
    readUInt32BE: e.readUInt32BE,
    readUInt32LE: e.readUInt32LE
  };
  function o(u, C, s, f) {
    s = s || 0;
    const h = f ? "BE" : "LE", x = "readUInt" + C + h;
    return E[x](u, s);
  }
  e.readUInt = o;
  function c(u, C) {
    if (u.length - C < 4)
      return;
    const s = (0, e.readUInt32BE)(u, C);
    if (!(u.length - C < s))
      return {
        name: (0, e.toUTF8String)(u, 4 + C, 8 + C),
        offset: C,
        size: s
      };
  }
  function l(u, C, s) {
    for (; s < u.length; ) {
      const f = c(u, s);
      if (!f)
        break;
      if (f.name === C)
        return f;
      s += f.size;
    }
  }
  e.findBox = l;
})(aA);
Object.defineProperty(uB, "__esModule", { value: !0 });
uB.BMP = void 0;
const fg = aA;
uB.BMP = {
  validate: (e) => (0, fg.toUTF8String)(e, 0, 2) === "BM",
  calculate: (e) => ({
    height: Math.abs((0, fg.readInt32LE)(e, 22)),
    width: (0, fg.readUInt32LE)(e, 18)
  })
};
var xB = {}, kt = {};
Object.defineProperty(kt, "__esModule", { value: !0 });
kt.ICO = void 0;
const zt = aA, cC = 1, fC = 6, uC = 16;
function Cr(e, t) {
  const A = e[t];
  return A === 0 ? 256 : A;
}
function cr(e, t) {
  const A = fC + t * uC;
  return {
    height: Cr(e, A + 1),
    width: Cr(e, A)
  };
}
kt.ICO = {
  validate(e) {
    const t = (0, zt.readUInt16LE)(e, 0), A = (0, zt.readUInt16LE)(e, 4);
    return t !== 0 || A === 0 ? !1 : (0, zt.readUInt16LE)(e, 2) === cC;
  },
  calculate(e) {
    const t = (0, zt.readUInt16LE)(e, 4), A = cr(e, 0);
    if (t === 1)
      return A;
    const i = [A];
    for (let B = 1; B < t; B += 1)
      i.push(cr(e, B));
    return {
      height: A.height,
      images: i,
      width: A.width
    };
  }
};
Object.defineProperty(xB, "__esModule", { value: !0 });
xB.CUR = void 0;
const xC = kt, ug = aA, hC = 2;
xB.CUR = {
  validate(e) {
    const t = (0, ug.readUInt16LE)(e, 0), A = (0, ug.readUInt16LE)(e, 4);
    return t !== 0 || A === 0 ? !1 : (0, ug.readUInt16LE)(e, 2) === hC;
  },
  calculate: (e) => xC.ICO.calculate(e)
};
var hB = {};
Object.defineProperty(hB, "__esModule", { value: !0 });
hB.DDS = void 0;
const xg = aA;
hB.DDS = {
  validate: (e) => (0, xg.readUInt32LE)(e, 0) === 542327876,
  calculate: (e) => ({
    height: (0, xg.readUInt32LE)(e, 12),
    width: (0, xg.readUInt32LE)(e, 16)
  })
};
var dB = {};
Object.defineProperty(dB, "__esModule", { value: !0 });
dB.GIF = void 0;
const hg = aA, dC = /^GIF8[79]a/;
dB.GIF = {
  validate: (e) => dC.test((0, hg.toUTF8String)(e, 0, 6)),
  calculate: (e) => ({
    height: (0, hg.readUInt16LE)(e, 8),
    width: (0, hg.readUInt16LE)(e, 6)
  })
};
var lB = {};
Object.defineProperty(lB, "__esModule", { value: !0 });
lB.HEIF = void 0;
const Fe = aA, lC = {
  avif: "avif",
  mif1: "heif",
  msf1: "heif",
  // hief-sequence
  heic: "heic",
  heix: "heic",
  hevc: "heic",
  // heic-sequence
  hevx: "heic"
  // heic-sequence
};
lB.HEIF = {
  validate(e) {
    const t = (0, Fe.toUTF8String)(e, 4, 8), A = (0, Fe.toUTF8String)(e, 8, 12);
    return t === "ftyp" && A in lC;
  },
  calculate(e) {
    const t = (0, Fe.findBox)(e, "meta", 0), A = t && (0, Fe.findBox)(e, "iprp", t.offset + 12), i = A && (0, Fe.findBox)(e, "ipco", A.offset + 8), B = i && (0, Fe.findBox)(e, "ispe", i.offset + 8);
    if (B)
      return {
        height: (0, Fe.readUInt32BE)(e, B.offset + 16),
        width: (0, Fe.readUInt32BE)(e, B.offset + 12),
        type: (0, Fe.toUTF8String)(e, 8, 12)
      };
    throw new TypeError("Invalid HEIF, no size found");
  }
};
var wB = {};
Object.defineProperty(wB, "__esModule", { value: !0 });
wB.ICNS = void 0;
const Hi = aA, wC = 8, yC = 4, DC = 4, pC = {
  ICON: 32,
  "ICN#": 32,
  // m => 16 x 16
  "icm#": 16,
  icm4: 16,
  icm8: 16,
  // s => 16 x 16
  "ics#": 16,
  ics4: 16,
  ics8: 16,
  is32: 16,
  s8mk: 16,
  icp4: 16,
  // l => 32 x 32
  icl4: 32,
  icl8: 32,
  il32: 32,
  l8mk: 32,
  icp5: 32,
  ic11: 32,
  // h => 48 x 48
  ich4: 48,
  ich8: 48,
  ih32: 48,
  h8mk: 48,
  // . => 64 x 64
  icp6: 64,
  ic12: 32,
  // t => 128 x 128
  it32: 128,
  t8mk: 128,
  ic07: 128,
  // . => 256 x 256
  ic08: 256,
  ic13: 256,
  // . => 512 x 512
  ic09: 512,
  ic14: 512,
  // . => 1024 x 1024
  ic10: 1024
};
function fr(e, t) {
  const A = t + DC;
  return [
    (0, Hi.toUTF8String)(e, t, A),
    (0, Hi.readUInt32BE)(e, A)
  ];
}
function ur(e) {
  const t = pC[e];
  return { width: t, height: t, type: e };
}
wB.ICNS = {
  validate: (e) => (0, Hi.toUTF8String)(e, 0, 4) === "icns",
  calculate(e) {
    const t = e.length, A = (0, Hi.readUInt32BE)(e, yC);
    let i = wC, B = fr(e, i), g = ur(B[0]);
    if (i += B[1], i === A)
      return g;
    const n = {
      height: g.height,
      images: [g],
      width: g.width
    };
    for (; i < A && i < t; )
      B = fr(e, i), g = ur(B[0]), i += B[1], n.images.push(g);
    return n;
  }
};
var yB = {};
Object.defineProperty(yB, "__esModule", { value: !0 });
yB.J2C = void 0;
const dg = aA;
yB.J2C = {
  // TODO: this doesn't seem right. SIZ marker doesn't have to be right after the SOC
  validate: (e) => (0, dg.toHexString)(e, 0, 4) === "ff4fff51",
  calculate: (e) => ({
    height: (0, dg.readUInt32BE)(e, 12),
    width: (0, dg.readUInt32BE)(e, 8)
  })
};
var DB = {};
Object.defineProperty(DB, "__esModule", { value: !0 });
DB.JP2 = void 0;
const ke = aA;
DB.JP2 = {
  validate(e) {
    if ((0, ke.readUInt32BE)(e, 4) !== 1783636e3 || (0, ke.readUInt32BE)(e, 0) < 1)
      return !1;
    const t = (0, ke.findBox)(e, "ftyp", 0);
    return t ? (0, ke.readUInt32BE)(e, t.offset + 4) === 1718909296 : !1;
  },
  calculate(e) {
    const t = (0, ke.findBox)(e, "jp2h", 0), A = t && (0, ke.findBox)(e, "ihdr", t.offset + 8);
    if (A)
      return {
        height: (0, ke.readUInt32BE)(e, A.offset + 8),
        width: (0, ke.readUInt32BE)(e, A.offset + 12)
      };
    throw new TypeError("Unsupported JPEG 2000 format");
  }
};
var pB = {};
Object.defineProperty(pB, "__esModule", { value: !0 });
pB.JPG = void 0;
const ae = aA, mC = "45786966", GC = 2, fn = 6, FC = 2, RC = "4d4d", SC = "4949", xr = 12, bC = 2;
function NC(e) {
  return (0, ae.toHexString)(e, 2, 6) === mC;
}
function UC(e, t) {
  return {
    height: (0, ae.readUInt16BE)(e, t),
    width: (0, ae.readUInt16BE)(e, t + 2)
  };
}
function vC(e, t) {
  const i = fn + 8, B = (0, ae.readUInt)(e, 16, i, t);
  for (let g = 0; g < B; g++) {
    const n = i + bC + g * xr, I = n + xr;
    if (n > e.length)
      return;
    const r = e.slice(n, I);
    if ((0, ae.readUInt)(r, 16, 0, t) === 274)
      return (0, ae.readUInt)(r, 16, 2, t) !== 3 || (0, ae.readUInt)(r, 32, 4, t) !== 1 ? void 0 : (0, ae.readUInt)(r, 16, 8, t);
  }
}
function HC(e, t) {
  const A = e.slice(GC, t), i = (0, ae.toHexString)(A, fn, fn + FC), B = i === RC;
  if (B || i === SC)
    return vC(A, B);
}
function YC(e, t) {
  if (t > e.length)
    throw new TypeError("Corrupt JPG, exceeded buffer limits");
}
pB.JPG = {
  validate: (e) => (0, ae.toHexString)(e, 0, 2) === "ffd8",
  calculate(e) {
    e = e.slice(4);
    let t, A;
    for (; e.length; ) {
      const i = (0, ae.readUInt16BE)(e, 0);
      if (e[i] !== 255) {
        e = e.slice(1);
        continue;
      }
      if (NC(e) && (t = HC(e, i)), YC(e, i), A = e[i + 1], A === 192 || A === 193 || A === 194) {
        const B = UC(e, i + 5);
        return t ? {
          height: B.height,
          orientation: t,
          width: B.width
        } : B;
      }
      e = e.slice(i + 2);
    }
    throw new TypeError("Invalid JPG, no size found");
  }
};
var mB = {};
Object.defineProperty(mB, "__esModule", { value: !0 });
mB.KTX = void 0;
const lg = aA;
mB.KTX = {
  validate: (e) => {
    const t = (0, lg.toUTF8String)(e, 1, 7);
    return ["KTX 11", "KTX 20"].includes(t);
  },
  calculate: (e) => {
    const t = e[5] === 49 ? "ktx" : "ktx2", A = t === "ktx" ? 36 : 20;
    return {
      height: (0, lg.readUInt32LE)(e, A + 4),
      width: (0, lg.readUInt32LE)(e, A),
      type: t
    };
  }
};
var GB = {};
Object.defineProperty(GB, "__esModule", { value: !0 });
GB.PNG = void 0;
const Ke = aA, LC = `PNG\r

`, MC = "IHDR", hr = "CgBI";
GB.PNG = {
  validate(e) {
    if (LC === (0, Ke.toUTF8String)(e, 1, 8)) {
      let t = (0, Ke.toUTF8String)(e, 12, 16);
      if (t === hr && (t = (0, Ke.toUTF8String)(e, 28, 32)), t !== MC)
        throw new TypeError("Invalid PNG");
      return !0;
    }
    return !1;
  },
  calculate(e) {
    return (0, Ke.toUTF8String)(e, 12, 16) === hr ? {
      height: (0, Ke.readUInt32BE)(e, 36),
      width: (0, Ke.readUInt32BE)(e, 32)
    } : {
      height: (0, Ke.readUInt32BE)(e, 20),
      width: (0, Ke.readUInt32BE)(e, 16)
    };
  }
};
var FB = {};
Object.defineProperty(FB, "__esModule", { value: !0 });
FB.PNM = void 0;
const wg = aA, dr = {
  P1: "pbm/ascii",
  P2: "pgm/ascii",
  P3: "ppm/ascii",
  P4: "pbm",
  P5: "pgm",
  P6: "ppm",
  P7: "pam",
  PF: "pfm"
}, lr = {
  default: (e) => {
    let t = [];
    for (; e.length > 0; ) {
      const A = e.shift();
      if (A[0] !== "#") {
        t = A.split(" ");
        break;
      }
    }
    if (t.length === 2)
      return {
        height: parseInt(t[1], 10),
        width: parseInt(t[0], 10)
      };
    throw new TypeError("Invalid PNM");
  },
  pam: (e) => {
    const t = {};
    for (; e.length > 0; ) {
      const A = e.shift();
      if (A.length > 16 || A.charCodeAt(0) > 128)
        continue;
      const [i, B] = A.split(" ");
      if (i && B && (t[i.toLowerCase()] = parseInt(B, 10)), t.height && t.width)
        break;
    }
    if (t.height && t.width)
      return {
        height: t.height,
        width: t.width
      };
    throw new TypeError("Invalid PAM");
  }
};
FB.PNM = {
  validate: (e) => (0, wg.toUTF8String)(e, 0, 2) in dr,
  calculate(e) {
    const t = (0, wg.toUTF8String)(e, 0, 2), A = dr[t], i = (0, wg.toUTF8String)(e, 3).split(/[\r\n]+/);
    return (lr[A] || lr.default)(i);
  }
};
var RB = {};
Object.defineProperty(RB, "__esModule", { value: !0 });
RB.PSD = void 0;
const yg = aA;
RB.PSD = {
  validate: (e) => (0, yg.toUTF8String)(e, 0, 4) === "8BPS",
  calculate: (e) => ({
    height: (0, yg.readUInt32BE)(e, 14),
    width: (0, yg.readUInt32BE)(e, 18)
  })
};
var SB = {};
Object.defineProperty(SB, "__esModule", { value: !0 });
SB.SVG = void 0;
const wr = aA, SQ = /<svg\s([^>"']|"[^"]*"|'[^']*')*>/, gi = {
  height: /\sheight=(['"])([^%]+?)\1/,
  root: SQ,
  viewbox: /\sviewBox=(['"])(.+?)\1/i,
  width: /\swidth=(['"])([^%]+?)\1/
}, Dg = 2.54, bQ = {
  in: 96,
  cm: 96 / Dg,
  em: 16,
  ex: 8,
  m: 96 / Dg * 100,
  mm: 96 / Dg / 10,
  pc: 96 / 72 / 12,
  pt: 96 / 72,
  px: 1
}, kC = new RegExp(`^([0-9.]+(?:e\\d+)?)(${Object.keys(bQ).join("|")})?$`);
function Yi(e) {
  const t = kC.exec(e);
  if (t)
    return Math.round(Number(t[1]) * (bQ[t[2]] || 1));
}
function KC(e) {
  const t = e.split(" ");
  return {
    height: Yi(t[3]),
    width: Yi(t[2])
  };
}
function JC(e) {
  const t = e.match(gi.width), A = e.match(gi.height), i = e.match(gi.viewbox);
  return {
    height: A && Yi(A[2]),
    viewbox: i && KC(i[2]),
    width: t && Yi(t[2])
  };
}
function WC(e) {
  return {
    height: e.height,
    width: e.width
  };
}
function qC(e, t) {
  const A = t.width / t.height;
  return e.width ? {
    height: Math.floor(e.width / A),
    width: e.width
  } : e.height ? {
    height: e.height,
    width: Math.floor(e.height * A)
  } : {
    height: t.height,
    width: t.width
  };
}
SB.SVG = {
  // Scan only the first kilo-byte to speed up the check on larger files
  validate: (e) => SQ.test((0, wr.toUTF8String)(e, 0, 1e3)),
  calculate(e) {
    const t = (0, wr.toUTF8String)(e).match(gi.root);
    if (t) {
      const A = JC(t[0]);
      if (A.width && A.height)
        return WC(A);
      if (A.viewbox)
        return qC(A, A.viewbox);
    }
    throw new TypeError("Invalid SVG");
  }
};
var bB = {};
Object.defineProperty(bB, "__esModule", { value: !0 });
bB.TGA = void 0;
const Ot = aA;
bB.TGA = {
  validate(e) {
    return (0, Ot.readUInt16LE)(e, 0) === 0 && (0, Ot.readUInt16LE)(e, 4) === 0;
  },
  calculate(e) {
    return {
      height: (0, Ot.readUInt16LE)(e, 14),
      width: (0, Ot.readUInt16LE)(e, 12)
    };
  }
};
var NB = {};
Object.defineProperty(NB, "__esModule", { value: !0 });
NB.TIFF = void 0;
const _t = nA, Te = aA;
function ZC(e, t, A) {
  const i = (0, Te.readUInt)(e, 32, 4, A);
  let B = 1024;
  const g = _t.statSync(t).size;
  i + B > g && (B = g - i - 10);
  const n = new Uint8Array(B), I = _t.openSync(t, "r");
  return _t.readSync(I, n, 0, B, i), _t.closeSync(I), n.slice(2);
}
function VC(e, t) {
  const A = (0, Te.readUInt)(e, 16, 8, t);
  return ((0, Te.readUInt)(e, 16, 10, t) << 16) + A;
}
function TC(e) {
  if (e.length > 24)
    return e.slice(12);
}
function PC(e, t) {
  const A = {};
  let i = e;
  for (; i && i.length; ) {
    const B = (0, Te.readUInt)(i, 16, 0, t), g = (0, Te.readUInt)(i, 16, 2, t), n = (0, Te.readUInt)(i, 32, 4, t);
    if (B === 0)
      break;
    n === 1 && (g === 3 || g === 4) && (A[B] = VC(i, t)), i = TC(i);
  }
  return A;
}
function XC(e) {
  const t = (0, Te.toUTF8String)(e, 0, 2);
  if (t === "II")
    return "LE";
  if (t === "MM")
    return "BE";
}
const zC = [
  // '492049', // currently not supported
  "49492a00",
  // Little endian
  "4d4d002a"
  // Big Endian
  // '4d4d002a', // BigTIFF > 4GB. currently not supported
];
NB.TIFF = {
  validate: (e) => zC.includes((0, Te.toHexString)(e, 0, 4)),
  calculate(e, t) {
    if (!t)
      throw new TypeError("Tiff doesn't support buffer");
    const A = XC(e) === "BE", i = ZC(e, t, A), B = PC(i, A), g = B[256], n = B[257];
    if (!g || !n)
      throw new TypeError("Invalid Tiff. Missing tags");
    return { height: n, width: g };
  }
};
var UB = {};
Object.defineProperty(UB, "__esModule", { value: !0 });
UB.WEBP = void 0;
const Se = aA;
function OC(e) {
  return {
    height: 1 + (0, Se.readUInt24LE)(e, 7),
    width: 1 + (0, Se.readUInt24LE)(e, 4)
  };
}
function _C(e) {
  return {
    height: 1 + ((e[4] & 15) << 10 | e[3] << 2 | (e[2] & 192) >> 6),
    width: 1 + ((e[2] & 63) << 8 | e[1])
  };
}
function jC(e) {
  return {
    height: (0, Se.readInt16LE)(e, 8) & 16383,
    width: (0, Se.readInt16LE)(e, 6) & 16383
  };
}
UB.WEBP = {
  validate(e) {
    const t = (0, Se.toUTF8String)(e, 0, 4) === "RIFF", A = (0, Se.toUTF8String)(e, 8, 12) === "WEBP", i = (0, Se.toUTF8String)(e, 12, 15) === "VP8";
    return t && A && i;
  },
  calculate(e) {
    const t = (0, Se.toUTF8String)(e, 12, 16);
    if (e = e.slice(20, 30), t === "VP8X") {
      const i = e[0], B = (i & 192) === 0, g = (i & 1) === 0;
      if (B && g)
        return OC(e);
      throw new TypeError("Invalid WebP");
    }
    if (t === "VP8 " && e[0] !== 47)
      return jC(e);
    const A = (0, Se.toHexString)(e, 3, 6);
    if (t === "VP8L" && A !== "9d012a")
      return _C(e);
    throw new TypeError("Invalid WebP");
  }
};
Object.defineProperty(Mt, "__esModule", { value: !0 });
Mt.typeHandlers = void 0;
const $C = uB, Ac = xB, ec = hB, tc = dB, ic = lB, Bc = wB, gc = kt, nc = yB, Ic = DB, rc = pB, Ec = mB, Qc = GB, oc = FB, ac = RB, sc = SB, Cc = bB, cc = NB, fc = UB;
Mt.typeHandlers = {
  bmp: $C.BMP,
  cur: Ac.CUR,
  dds: ec.DDS,
  gif: tc.GIF,
  heif: ic.HEIF,
  icns: Bc.ICNS,
  ico: gc.ICO,
  j2c: nc.J2C,
  jp2: Ic.JP2,
  jpg: rc.JPG,
  ktx: Ec.KTX,
  png: Qc.PNG,
  pnm: oc.PNM,
  psd: ac.PSD,
  svg: sc.SVG,
  tga: Cc.TGA,
  tiff: cc.TIFF,
  webp: fc.WEBP
};
var vB = {};
Object.defineProperty(vB, "__esModule", { value: !0 });
vB.detector = void 0;
const un = Mt, uc = Object.keys(un.typeHandlers), yr = {
  56: "psd",
  66: "bmp",
  68: "dds",
  71: "gif",
  73: "tiff",
  77: "tiff",
  82: "webp",
  105: "icns",
  137: "png",
  255: "jpg"
};
function xc(e) {
  const t = e[0];
  if (t in yr) {
    const i = yr[t];
    if (i && un.typeHandlers[i].validate(e))
      return i;
  }
  const A = (i) => un.typeHandlers[i].validate(e);
  return uc.find(A);
}
vB.detector = xc;
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.types = t.setConcurrency = t.disableTypes = t.disableFS = t.imageSize = void 0;
  const A = nA, i = vA, B = CC, g = Mt, n = vB, I = 512 * 1024, r = new B.default({ concurrency: 100, autostart: !0 }), a = {
    disabledFS: !1,
    disabledTypes: []
  };
  function Q(s, f) {
    const h = (0, n.detector)(s);
    if (typeof h < "u") {
      if (a.disabledTypes.indexOf(h) > -1)
        throw new TypeError("disabled file type: " + h);
      if (h in g.typeHandlers) {
        const x = g.typeHandlers[h].calculate(s, f);
        if (x !== void 0)
          return x.type = x.type ?? h, x;
      }
    }
    throw new TypeError("unsupported file type: " + h + " (file: " + f + ")");
  }
  async function E(s) {
    const f = await A.promises.open(s, "r");
    try {
      const { size: h } = await f.stat();
      if (h <= 0)
        throw new Error("Empty file");
      const x = Math.min(h, I), d = new Uint8Array(x);
      return await f.read(d, 0, x, 0), d;
    } finally {
      await f.close();
    }
  }
  function o(s) {
    const f = A.openSync(s, "r");
    try {
      const { size: h } = A.fstatSync(f);
      if (h <= 0)
        throw new Error("Empty file");
      const x = Math.min(h, I), d = new Uint8Array(x);
      return A.readSync(f, d, 0, x, 0), d;
    } finally {
      A.closeSync(f);
    }
  }
  e.exports = t = c, t.default = c;
  function c(s, f) {
    if (s instanceof Uint8Array)
      return Q(s);
    if (typeof s != "string" || a.disabledFS)
      throw new TypeError("invalid invocation. input should be a Uint8Array");
    const h = i.resolve(s);
    if (typeof f == "function")
      r.push(() => E(h).then((x) => process.nextTick(f, null, Q(x, h))).catch(f));
    else {
      const x = o(h);
      return Q(x, h);
    }
  }
  t.imageSize = c;
  const l = (s) => {
    a.disabledFS = s;
  };
  t.disableFS = l;
  const u = (s) => {
    a.disabledTypes = s;
  };
  t.disableTypes = u;
  const C = (s) => {
    r.concurrency = s;
  };
  t.setConcurrency = C, t.types = Object.keys(g.typeHandlers);
})(Cn, Cn.exports);
var hc = Cn.exports;
const dc = /* @__PURE__ */ gB(hc);
(function(e, t) {
  const A = ie, i = e();
  for (; ; )
    try {
      if (-parseInt(A(204)) / 1 + -parseInt(A(213)) / 2 + parseInt(A(231)) / 3 * (parseInt(A(196)) / 4) + -parseInt(A(212)) / 5 + parseInt(A(227)) / 6 * (parseInt(A(198)) / 7) + -parseInt(A(235)) / 8 + parseInt(A(217)) / 9 * (parseInt(A(242)) / 10) === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(Li, 445871);
const lc = /* @__PURE__ */ function() {
  let e = !0;
  return function(t, A) {
    const i = e ? function() {
      const B = ie;
      if (A) {
        const g = A[B(211)](t, arguments);
        return A = null, g;
      }
    } : function() {
    };
    return e = !1, i;
  };
}(), xn = lc(void 0, function() {
  const e = ie, t = {};
  t.VZjcN = e(215);
  const A = t;
  return xn[e(237)]()[e(223)](A[e(202)])[e(237)]()[e(193)](xn)[e(223)](A[e(202)]);
});
xn();
let at = null;
function NQ(e, t, A) {
  const i = ie, B = {};
  B.IUvny = i(190), B[i(240)] = i(214), B[i(208)] = i(218), B.DWsnf = i(226), B.mckLF = i(229), B[i(188)] = '{"appearance":{"isSplitViewMode":true},"msg":{}}';
  const g = B, n = rA.join(A, g[i(228)], g[i(240)]);
  console.log(g.uboHf, n);
  const I = {};
  I.recursive = !0, qe[i(238)](n, I);
  const r = rA[i(192)](A, g.IUvny, g.DWsnf);
  let a = Tn();
  try {
    a = qe[i(236)](rA[i(192)](r), i(229));
  } catch {
    qe[i(222)](rA[i(192)](r), a, g[i(201)]);
  }
  const Q = {};
  Q[i(191)] = A;
  const E = {};
  E[i(220)] = "", E[i(206)] = 0, E[i(194)] = "", E[i(205)] = "", E.platform = 3, E.language = "", E[i(195)] = "", E.userId = "", E[i(239)] = "", E[i(216)] = "", E.bundleId = "", E.serverUrl = "", E.fixedAfterHitKeys = [""];
  const o = {};
  o[i(199)] = e, o[i(241)] = t, o[i(207)] = Q, o[i(210)] = ot[i(233)], o.a2 = "", o.d2 = "", o.d2Key = "", o[i(221)] = "", o[i(187)] = 3, o.platVer = Og, o[i(197)] = rE, o[i(232)] = E, o.defaultFileDownloadPath = n, o[i(234)] = {}, o.deviceConfig = g[i(188)], o[i(234)][i(224)] = a, o[i(234)].buildVer = Fo[i(225)], o[i(234)].localId = 2052, o[i(234)][i(230)] = gE, o[i(234)][i(203)] = mI, o[i(234)][i(200)] = "", o[i(234)][i(243)] = Og, o[i(234)][i(219)] = mI, o[i(234)][i(209)] = !1, o[i(234)][i(189)] = 0;
  const c = o;
  return at = c, console[i(186)](at), c;
}
function ie(e, t) {
  const A = Li();
  return ie = function(i, B) {
    i = i - 186;
    let g = A[i];
    if (ie.NVGXeZ === void 0) {
      var n = function(Q) {
        const E = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
        let o = "", c = "", l = o + n;
        for (let u = 0, C, s, f = 0; s = Q.charAt(f++); ~s && (C = u % 4 ? C * 64 + s : s, u++ % 4) ? o += l.charCodeAt(f + 10) - 10 !== 0 ? String.fromCharCode(255 & C >> (-2 * u & 6)) : u : 0)
          s = E.indexOf(s);
        for (let u = 0, C = o.length; u < C; u++)
          c += "%" + ("00" + o.charCodeAt(u).toString(16)).slice(-2);
        return decodeURIComponent(c);
      };
      ie.Vbkjpz = n, e = arguments, ie.NVGXeZ = !0;
    }
    const I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      const Q = function(E) {
        this.fBUSQm = E, this.IHlmlW = [1, 0, 0], this.TBcKTA = function() {
          return "newState";
        }, this.NuZRRn = "\\w+ *\\(\\) *{\\w+ *", this.YcGgzQ = `['|"].+['|"];? *}`;
      };
      Q.prototype.CDfrQi = function() {
        const E = new RegExp(this.NuZRRn + this.YcGgzQ), o = E.test(this.TBcKTA.toString()) ? --this.IHlmlW[1] : --this.IHlmlW[0];
        return this.JKiuHt(o);
      }, Q.prototype.JKiuHt = function(E) {
        return ~E ? this.mgcHAd(this.fBUSQm) : E;
      }, Q.prototype.mgcHAd = function(E) {
        for (let o = 0, c = this.IHlmlW.length; o < c; o++)
          this.IHlmlW.push(Math.round(Math.random())), c = this.IHlmlW.length;
        return E(this.IHlmlW[0]);
      }, new Q(ie).CDfrQi(), g = ie.Vbkjpz(g), e[r] = g;
    }
    return g;
  }, ie(e, t);
}
function Li() {
  const e = ["mJfqzLf6r1y", "C2vSzLvPBG", "DMvUzg9YtMfTzq", "BwnRtey", "vLPQy04", "zgv2vhLWzq", "ntmWmtKXuwnusxfv", "Bg9NAwnfBNzPCM9UBwvUDa", "C3LZDgvTswq", "zgvZA3rVCfbHDgHdB25MAwC", "DwjVsgy", "C2v0txv0zq", "y2XPzw50vMvY", "yxbWBhK", "mty0nJy0nxPTzhv6Aq", "mte0nZe1nezrwevvwG", "DgvTCa", "kcGOlISPkYKRksSK", "B3nwzxjZAw9U", "mJm0quv5EgPv", "zg93BMXVywrqyxrO", "DMvUzg9Yt3noyw1L", "yxbWs2v5", "BwfJAgLUzuLK", "D3jPDgvgAwXLu3LUyW", "C2vHCMnO", "z3vPza", "DMvYC2LVBG", "z3vPzc50Ehq", "mtCZnJeWuMDdr2DZ", "svv2BNK", "DxrMltG", "zgv2tMfTzq", "m09csen2qW", "CMrLBgL2zxj5q29UzMLN", "y3vYvMvYC2LVBG", "zgv2AwnLsw5MBW", "ndmZnZeYmfHzEvj3wa", "CMvHzezPBgvtEw5J", "Dg9tDhjPBMC", "BwTKAxjtEw5J", "yxbWvMvYC2LVBG", "CePnrNC", "C2vSzLvPza", "nZiYnZeWrMj6v2v5", "B3nwzxi", "Bg9N", "CgXHDgzVCM0", "A2PgC2i", "DMvUzg9YvhLWzq", "tMfWq2f0", "ywnJB3vUDf9WyxrO", "AM9PBG", "y29UC3rYDwn0B3i", "yxbWswq", "C2rRvMvYC2LVBG", "mtGYmtaYognhENDpza", "yxbWAwq"];
  return Li = function() {
    return e;
  }, Li();
}
const uu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  genSessionConfig: NQ,
  get sessionConfig() {
    return at;
  }
}, Symbol.toStringTag, { value: "Module" })), Je = dA;
(function(e, t) {
  const A = dA, i = e();
  for (; ; )
    try {
      if (parseInt(A(344)) / 1 * (-parseInt(A(322)) / 2) + -parseInt(A(329)) / 3 * (-parseInt(A(306)) / 4) + -parseInt(A(266)) / 5 * (-parseInt(A(343)) / 6) + -parseInt(A(341)) / 7 + -parseInt(A(282)) / 8 * (parseInt(A(268)) / 9) + -parseInt(A(300)) / 10 * (-parseInt(A(285)) / 11) + -parseInt(A(295)) / 12 * (parseInt(A(326)) / 13) === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(Mi, 822918);
const wc = function() {
  const e = dA, t = { cAMIO: function(i, B) {
    return i === B;
  }, cQBYV: e(332), yQVmC: function(i, B) {
    return i(B);
  }, pEXmb: e(316) };
  let A = !0;
  return function(i, B) {
    const g = e, n = { wezkq: function(r, a) {
      return t[dA(327)](r, a);
    }, erhHn: t[g(291)] }, I = A ? function() {
      var a;
      const r = g;
      if (t.cAMIO(t.cQBYV, "igNOf")) {
        if (B) {
          const Q = B.apply(i, arguments);
          return B = null, Q;
        }
      } else
        n[r(271)](_0xe2417b, new _0x38e849(n[r(302)])), (a = _0x447ae3[r(304)][r(269)][r(275)]) == null || a.removeKernelMsgListener(_0x542584);
    } : function() {
    };
    return A = !1, I;
  };
}(), hn = wc(void 0, function() {
  const e = dA, t = {};
  t[e(317)] = e(272);
  const A = t;
  return hn[e(307)]().search(A.rPvak).toString()[e(310)](hn)[e(324)](A[e(317)]);
});
hn();
function Mi() {
  const e = ["mJC5mJCZnNb4rLnKrW", "B25sAwnOtwvKAwfeB3DUBg9HzenVBxbSzxrL", "u01Nz3O", "mJK3u3njuuXT", "DxrPBa", "tM15rKK", "vennrxa", "rMLpDva", "zxHPC3rZu3LUyW", "CevyBwi", "AM9PBG", "z2v0rMLSzvnPEMu", "ueLd", "mtG4ntj2tLvovvq", "zg93BMXVywruExbL", "zMLSzvr5CgvgCM9TrMLSzq", "uezPwLC", "zMLSzu1VzgvSswq", "ndG3otKWBLDABffv", "zw1kEve", "zxjOsg4", "vu52A0W", "C2vYDMLJzq", "zgvMyxvSDezPBgveB3DUBg9HzfbHDgG", "mtKYAfnoChnJ", "Dg9tDhjPBMC", "zMLSzvbHDgG", "y29WEuzPBgu", "y29UC3rYDwn0B3i", "Bg5oB2e", "vNLjzNG", "yxbWBhK", "BLrZugC", "Bwq1sgv4u3rY", "5lIl6l296lAf5PE2", "CLb2ywS", "Aw5KzxHpzG", "BxnNswq", "z2v0sw1Hz2vtAxPL", "AfPLtK0", "mLHOwMrjrq", "DxbSB2fKrMLSzq", "C2vHCMnO", "rvbeBw8", "mZi2m2zPwwzxyG", "EvfwBum", "y2nxBK0", "odGZntzyA0nnEMC", "zwXLBwvUDfn1yLr5Cgu", "z2v0rMLSzvr5Cgu", "AwDot2y", "yMfZzw5HBwu", "zMLSzu5HBwu", "teDUDKO", "zMLSzvnPEMu", "DgH1BwjtAxPL", "yKHdB2G", "DhzcDge", "ru1vywC", "mtq4ndi2nLzsDgLIra", "D3jHChbLCG", "ndi1nfbIv2D0BW", "mtaWmJaWmMHcExfyBa", "yMHsshy", "wfDSs0i", "zg93BMXVywrtB3vYy2vuExbL", "C3rHCNrZv2L0Aa", "nti3mePqqvvxzq", "AuTAtM0", "mJDsDhjnwhq", "BxnN", "CgvLCLvPza", "D2v6A3e", "kcGOlISPkYKRksSK", "yLDktKi", "BMvLzenYzwf0zq", "A2vYBMvSu2vYDMLJzq", "vgrNwK0", "y2HHDfr5Cgu", "DfDptLe", "CMvTB3zLs2vYBMvStxnNtgLZDgvUzxi", "sM1jBvG", "z2v0uMLJAe1LzgLHrMLSzvbHDgHgB3jhDwLSza"];
  return Mi = function() {
    return e;
  }, Mi();
}
function dA(e, t) {
  const A = Mi();
  return dA = function(i, B) {
    i = i - 266;
    let g = A[i];
    if (dA.SmAxOj === void 0) {
      var n = function(Q) {
        const E = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
        let o = "", c = "", l = o + n;
        for (let u = 0, C, s, f = 0; s = Q.charAt(f++); ~s && (C = u % 4 ? C * 64 + s : s, u++ % 4) ? o += l.charCodeAt(f + 10) - 10 !== 0 ? String.fromCharCode(255 & C >> (-2 * u & 6)) : u : 0)
          s = E.indexOf(s);
        for (let u = 0, C = o.length; u < C; u++)
          c += "%" + ("00" + o.charCodeAt(u).toString(16)).slice(-2);
        return decodeURIComponent(c);
      };
      dA.GiDptS = n, e = arguments, dA.SmAxOj = !0;
    }
    const I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      const Q = function(E) {
        this.ueZsjV = E, this.NfgoJz = [1, 0, 0], this.PNSXQj = function() {
          return "newState";
        }, this.aeIMua = "\\w+ *\\(\\) *{\\w+ *", this.uZNmPI = `['|"].+['|"];? *}`;
      };
      Q.prototype.kdVsRC = function() {
        const E = new RegExp(this.aeIMua + this.uZNmPI), o = E.test(this.PNSXQj.toString()) ? --this.NfgoJz[1] : --this.NfgoJz[0];
        return this.nAaVBb(o);
      }, Q.prototype.nAaVBb = function(E) {
        return ~E ? this.mGRuJT(this.ueZsjV) : E;
      }, Q.prototype.mGRuJT = function(E) {
        for (let o = 0, c = this.NfgoJz.length; o < c; o++)
          this.NfgoJz.push(Math.round(Math.random())), c = this.NfgoJz.length;
        return E(this.NfgoJz[0]);
      }, new Q(dA).kdVsRC(), g = dA.GiDptS(g), e[r] = g;
    }
    return g;
  }, dA(e, t);
}
class ye {
  static async getFileType(t) {
    return p0[dA(297)](t);
  }
  static async copyFile(t, A) {
    const i = dA;
    await tA[i(342)][i(286)][i(309)](t, A);
  }
  static async [Je(293)](t) {
    const A = Je;
    return await tA[A(342)][A(286)][A(293)](t);
  }
  static async [Je(323)](t, A = oA[Je(294)], i = 0) {
    var c;
    const B = Je, g = { lnNoa: function(l, u) {
      return l(u);
    }, LSzXA: function(l, u) {
      return l === u;
    } }, n = await g[B(311)](DQ, t);
    let I = ((c = await ye[B(331)](t)) == null ? void 0 : c.ext) || "";
    I && (I = "." + I);
    let r = "" + vA[B(333)](t);
    g.LSzXA(r[B(318)]("."), -1) && (r += I);
    const a = {};
    a[B(315)] = n, a.fileName = r, a.elementType = A, a[B(330)] = i, a[B(337)] = 0, a[B(274)] = !0, a[B(296)] = 1, a.file_uuid = "";
    const Q = tA[B(304)][B(269)][B(275)][B(281)](a);
    await ye[B(309)](t, Q);
    const E = await ye.getFileSize(t), o = {};
    return o.md5 = n, o[B(334)] = r, o.path = Q, o[B(336)] = E, o.ext = I, o;
  }
  static async downloadMedia(t, A, i, B, g, n, I = 1e3 * 60 * 2) {
    const r = Je, a = { TdgZM: function(E, o) {
      return E === o;
    }, LGnvJ: r(288), UNvkL: function(E, o) {
      return E(o);
    }, JmImX: function(E, o, c) {
      return E(o, c);
    } };
    if (n && nA[r(290)](n))
      return n;
    const Q = new iB();
    return new Promise((E, o) => {
      var f;
      const c = r, l = { emJyQ: function(h, x) {
        return a[dA(276)](h, x);
      }, PFiZW: a[c(335)], NmyFI: function(h, x) {
        return a[c(303)](h, x);
      }, hZeNM: c(316), VyIfx: c(273) };
      let u = !1;
      Q[c(283)] = (h) => {
        var d;
        const x = c;
        if (l[x(301)](h[x(319)], t))
          if (l[x(298)] !== l[x(298)]) {
            if (_0x5e69cb) {
              const m = _0x5c79cd[x(313)](_0x3e4f0d, arguments);
              return _0x55188a = null, m;
            }
          } else {
            u = !0;
            let m = h[x(308)];
            if (m.startsWith("\\")) {
              const H = at == null ? void 0 : at.defaultFileDownloadPath;
              m = vA[x(292)](H, m);
            }
            E(m), (d = tA[x(304)][x(269)].kernelService) == null || d[x(279)](C);
          }
      };
      const C = tA.service.msg.addMsgListener(Q);
      a[c(280)](setTimeout, () => {
        var x, d;
        const h = c;
        l[h(301)](l[h(312)], h(314)) ? !_0x5cc145 && (l[h(287)](_0x5a01b5, new _0x3c0159(l[h(321)])), (x = _0x215e6e.service[h(269)][h(275)]) == null || x[h(279)](_0x50bc91)) : !u && (o(new Error(l[h(321)])), (d = tA[h(304)].msg[h(275)]) == null || d[h(279)](C));
      }, I);
      const s = {};
      s[c(299)] = "0", s[c(347)] = 0, s.triggerType = 1, s.msgId = t, s[c(277)] = A, s[c(270)] = i, s.elementId = B, s[c(337)] = 0, s[c(296)] = 1, s[c(308)] = g, (f = tA[c(304)][c(269)][c(275)]) == null || f.downloadRichMedia(s);
    });
  }
  static async [Je(320)](t) {
    const A = Je, i = { BIpZz: function(B, g) {
      return B(g);
    }, bHCoh: A(289), tvBta: function(B, g) {
      return B(g);
    }, EMUag: A(325), TLONo: function(B, g, n) {
      return B(g, n);
    } };
    return new Promise((B, g) => {
      const n = A, I = { ccWnM: function(r, a) {
        return r(a);
      }, SMggz: function(r, a) {
        return i.BIpZz(r, a);
      }, XWlKB: i[n(338)], iKZNm: function(r, a) {
        return i[n(339)](r, a);
      }, oyMJU: function(r, a) {
        return r !== a;
      }, bhRHv: "VuNBI", qqrEK: i[n(340)] };
      i.TLONo(dc, t, (r, a) => {
        var o, c;
        const Q = n, E = { tWONQ: function(l, u) {
          return I[dA(284)](l, u);
        } };
        if (r) {
          if (I[Q(346)] === I[Q(346)])
            I[Q(267)](g, r);
          else if (_0x4b8ce5[Q(319)] === _0x5d624f) {
            _0x1fa721 = !0;
            let l = _0xad9868[Q(308)];
            if (l[Q(348)]("\\")) {
              const u = _0x1bd81d == null ? void 0 : _0x1bd81d[Q(305)];
              l = _0xa9f4dd.join(u, l);
            }
            I[Q(328)](_0x1d5f1d, l), (o = _0x1208f5[Q(304)][Q(269)][Q(275)]) == null || o[Q(279)](_0x74bdce);
          }
        } else if (I.oyMJU(I[Q(345)], I.qqrEK))
          B(a);
        else {
          _0x2e236c = !0;
          let l = _0x270651.filePath;
          if (l[Q(348)]("\\")) {
            const u = _0x41cd7c == null ? void 0 : _0x41cd7c[Q(305)];
            l = _0x31af76[Q(292)](u, l);
          }
          E[Q(278)](_0x34b4a4, l), (c = _0x34f941[Q(304)][Q(269)][Q(275)]) == null || c[Q(279)](_0x35bfcf);
        }
      });
    });
  }
}
var pg = Be;
function ki() {
  var e = ["mZq5mgTHrwPeuG", "C2vYDMLJzq", "yMH2t3i", "uujkBgS", "s2H3svO", "zNjPzw5KvwLK", "CMvXvgLTzq", "ndv1yNfYu2O", "mZCYmda3ywPrueLl", "yxbWCM92ywXgCMLLBMrszxf1zxn0", "mtm5ndyWn1PmqK9wqq", "C2vHCMnO", "rwjfv3i", "mtbNvuvxDKe", "EgHzyNC", "txDtu2W", "kcGOlISPkYKRksSK", "zMnuuwK", "ELDzD3G", "z2v0rNjPzw5KCW", "y29UC3rYDwn0B3i", "yxbWBhK", "otK1ndmYuhfUvffJ", "mZu2ntGWnZDrsvvQvwG", "uuDTqu0", "mKnUtgflqq", "mtjpsuLZzvy", "senIAee", "ywnJzxb0", "ANvtD0m", "DwDhseq", "AgfUzgXLrNjPzw5KuMvXDwvZDa", "yNvKzhK", "Dg9tDhjPBMC", "mtuYmJrIs2P0CuS", "vMDzuhu", "rfjAuwm", "mJq2EuLYrxLO", "A2vYBMvSu2vYDMLJzq", "mte3odG3vfDPrLvl", "mtm3ndy0ngzwqNnftW", "DLfOqMG"];
  return ki = function() {
    return e;
  }, ki();
}
(function(e, t) {
  for (var A = Be, i = e(); ; )
    try {
      var B = -parseInt(A(301)) / 1 + parseInt(A(318)) / 2 * (parseInt(A(303)) / 3) + parseInt(A(333)) / 4 * (-parseInt(A(306)) / 5) + -parseInt(A(330)) / 6 * (parseInt(A(332)) / 7) + parseInt(A(315)) / 8 * (-parseInt(A(300)) / 9) + parseInt(A(293)) / 10 * (-parseInt(A(327)) / 11) + -parseInt(A(319)) / 12 * (-parseInt(A(316)) / 13);
      if (B === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(ki, 352827);
var yc = function() {
  var e = Be, t = {};
  t[e(305)] = function(B, g) {
    return B !== g;
  }, t[e(320)] = e(329), t[e(323)] = e(310), t.KhwIZ = e(322), t.MwSSl = e(334);
  var A = t, i = !0;
  return function(B, g) {
    var n = e, I = { xhYbw: n(309), VgYPu: function(Q, E) {
      return A.EbEWr(Q, E);
    }, bhvOr: A[n(320)], zWYwx: A[n(323)] };
    if (A[n(297)] === A[n(308)]) {
      if (_0x7f2449) {
        var r = _0x4eef73[n(314)](_0x2173e0, arguments);
        return _0x30996f = null, r;
      }
    } else {
      var a = i ? function() {
        var u;
        var Q = n, E = {};
        E[Q(296)] = I[Q(307)];
        var o = E;
        if (I[Q(328)](I[Q(295)], I[Q(295)])) {
          var c = {};
          c[Q(298)] = _0x4523f9[Q(298)], c.reqTime = _0x450da3[Q(299)], c[Q(321)] = _0x3a8900, (u = _0x463da4[Q(294)][Q(325)].kernelService) == null || u.approvalFriendRequest(c);
        } else if (g)
          if (I[Q(311)] === I[Q(311)]) {
            var l = g[Q(314)](B, arguments);
            return g = null, l;
          } else
            return _0x3f6087[Q(326)]()[Q(304)](o[Q(296)]).toString()[Q(313)](_0x497038)[Q(304)](o[Q(296)]);
      } : function() {
      };
      return i = !1, a;
    }
  };
}(), dn = yc(void 0, function() {
  var e = Be, t = {};
  t[e(317)] = e(309);
  var A = t;
  return dn[e(326)]()[e(304)](A.QGmAM).toString()[e(313)](dn)[e(304)](A[e(317)]);
});
dn();
function Be(e, t) {
  var A = ki();
  return Be = function(i, B) {
    i = i - 293;
    var g = A[i];
    if (Be.YdIUGo === void 0) {
      var n = function(E) {
        for (var o = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=", c = "", l = "", u = c + n, C = 0, s, f, h = 0; f = E.charAt(h++); ~f && (s = C % 4 ? s * 64 + f : f, C++ % 4) ? c += u.charCodeAt(h + 10) - 10 !== 0 ? String.fromCharCode(255 & s >> (-2 * C & 6)) : C : 0)
          f = o.indexOf(f);
        for (var x = 0, d = c.length; x < d; x++)
          l += "%" + ("00" + c.charCodeAt(x).toString(16)).slice(-2);
        return decodeURIComponent(l);
      };
      Be.Cythba = n, e = arguments, Be.YdIUGo = !0;
    }
    var I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      var Q = function(E) {
        this.VknAIL = E, this.oqzBjI = [1, 0, 0], this.bBWvhC = function() {
          return "newState";
        }, this.ddHrOY = "\\w+ *\\(\\) *{\\w+ *", this.fmRmWN = `['|"].+['|"];? *}`;
      };
      Q.prototype.PaFtXd = function() {
        var E = new RegExp(this.ddHrOY + this.fmRmWN), o = E.test(this.bBWvhC.toString()) ? --this.oqzBjI[1] : --this.oqzBjI[0];
        return this.WYQGjA(o);
      }, Q.prototype.WYQGjA = function(E) {
        return ~E ? this.aIksua(this.VknAIL) : E;
      }, Q.prototype.aIksua = function(E) {
        for (var o = 0, c = this.oqzBjI.length; o < c; o++)
          this.oqzBjI.push(Math.round(Math.random())), c = this.oqzBjI.length;
        return E(this.oqzBjI[0]);
      }, new Q(Be).PaFtXd(), g = Be.Cythba(g), e[r] = g;
    }
    return g;
  }, Be(e, t);
}
class Dc {
  static async [pg(312)](t = !1) {
  }
  static async [pg(324)](t, A) {
    var g;
    var i = pg, B = {};
    B[i(298)] = t[i(298)], B[i(299)] = t[i(299)], B[i(321)] = A, (g = tA[i(294)][i(325)][i(331)]) == null || g[i(302)](B);
  }
}
const xA = lA;
(function(e, t) {
  const A = lA, i = e();
  for (; ; )
    try {
      if (parseInt(A(168)) / 1 * (-parseInt(A(157)) / 2) + parseInt(A(161)) / 3 + -parseInt(A(149)) / 4 + parseInt(A(167)) / 5 + parseInt(A(136)) / 6 * (-parseInt(A(158)) / 7) + -parseInt(A(145)) / 8 * (parseInt(A(156)) / 9) + parseInt(A(155)) / 10 === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(Ki, 130966);
function Ki() {
  const e = ["B3bLCMf0zvn5C05VDgLMEq", "mJq4nZmWBhnzsvzx", "CMvTB3zLs2vYBMvSr3jVDxbmAxn0zw5LCG", "DgHLBG", "kcGOlISPkYKRksSK", "z2v0r3jVDxbnzw1IzxjZ", "z2v0r3jVDxbjz25VCMvoB3rPzMLLCW", "mta4mdiYmfjOBur4wa", "mJuYodnwuM9OwNO", "yLjquwO", "ChvIBgLZAeDYB3vWqNvSBgv0Aw4", "qvb3rgi", "C2vYDMLJzq", "A2LJA01LBwjLCG", "ugTPuvy", "C2v0r3jVDxbtAhv0vxa", "Bw9KAwz5twvTyMvYq2fYze5HBwu", "DhLWzq", "Bw9KAwz5twvTyMvYuM9Szq", "v3jAEgK", "mZu1nZa0DNPZA2jP", "rLHHq2O", "uvfHz3q", "C2v0twvTyMvYuM9Szq", "DvHuAxm", "Bw9KAwz5r3jVDxboyw1L", "C2v0twvTyMvYq2fYza", "z3jVDxa", "CxvPDeDYB3vW", "nJCZnZz6uLPXrLe", "z2v0r3jVDxbZ", "EKzMuui", "A2vYBMvSu2vYDMLJzq", "mtKYmZu2rxzuAhbT", "txDNELy", "y29UC3rYDwn0B3i", "wMv3DMm", "z2v0r3jVDxbmAxn0", "Dg9tDhjPBMC", "ndm3mZKYmgrizwvRBG", "mtuZCfbPy3LP", "mtrSsg9tru8", "mJH6v3zWBvK", "C2vHCMnO"];
  return Ki = function() {
    return e;
  }, Ki();
}
const pc = function() {
  const e = lA, t = {};
  t[e(137)] = function(B, g) {
    return B !== g;
  }, t[e(147)] = e(135);
  const A = t;
  let i = !0;
  return function(B, g) {
    var I;
    const n = e;
    if (A[n(137)](A[n(147)], A.zFfQB))
      return (I = _0x36abe0[n(172)][n(143)][n(148)]) == null ? void 0 : I[n(134)](_0x57dd08, _0x37b4c1, _0x10022f);
    {
      const r = i ? function() {
        if (g) {
          const a = g.apply(B, arguments);
          return g = null, a;
        }
      } : function() {
      };
      return i = !1, r;
    }
  };
}(), ln = pc(void 0, function() {
  const e = lA, t = {};
  t.uXTis = "(((.+)+)+)+$";
  const A = t;
  return ln[e(154)]()[e(159)](A[e(140)])[e(154)]()[e(151)](ln)[e(159)](e(164));
});
function lA(e, t) {
  const A = Ki();
  return lA = function(i, B) {
    i = i - 133;
    let g = A[i];
    if (lA.UIrPRv === void 0) {
      var n = function(Q) {
        const E = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
        let o = "", c = "", l = o + n;
        for (let u = 0, C, s, f = 0; s = Q.charAt(f++); ~s && (C = u % 4 ? C * 64 + s : s, u++ % 4) ? o += l.charCodeAt(f + 10) - 10 !== 0 ? String.fromCharCode(255 & C >> (-2 * u & 6)) : u : 0)
          s = E.indexOf(s);
        for (let u = 0, C = o.length; u < C; u++)
          c += "%" + ("00" + o.charCodeAt(u).toString(16)).slice(-2);
        return decodeURIComponent(c);
      };
      lA.tQHUGm = n, e = arguments, lA.UIrPRv = !0;
    }
    const I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      const Q = function(E) {
        this.SdmSBd = E, this.NxmiqA = [1, 0, 0], this.tJwBGM = function() {
          return "newState";
        }, this.nQJoKe = "\\w+ *\\(\\) *{\\w+ *", this.ksoyow = `['|"].+['|"];? *}`;
      };
      Q.prototype.ykwrMU = function() {
        const E = new RegExp(this.nQJoKe + this.ksoyow), o = E.test(this.tJwBGM.toString()) ? --this.NxmiqA[1] : --this.NxmiqA[0];
        return this.siHQxp(o);
      }, Q.prototype.siHQxp = function(E) {
        return ~E ? this.hswZXI(this.SdmSBd) : E;
      }, Q.prototype.hswZXI = function(E) {
        for (let o = 0, c = this.NxmiqA.length; o < c; o++)
          this.NxmiqA.push(Math.round(Math.random())), c = this.NxmiqA.length;
        return E(this.NxmiqA[0]);
      }, new Q(lA).ykwrMU(), g = lA.tQHUGm(g), e[r] = g;
    }
    return g;
  }, lA(e, t);
}
ln();
class mc {
  static async [xA(146)](t = !1) {
    const A = { QQagt: function(B, g) {
      return B !== g;
    }, MwgzV: "DVaDd", APwDb: function(B, g) {
      return B(g);
    }, bRPQj: function(B, g) {
      return B(g);
    }, JzIhy: function(B, g, n) {
      return B(g, n);
    } };
    let i = !1;
    return new Promise((B, g) => {
      var Q;
      const n = lA, I = { PkiQV: function(E, o) {
        return A[lA(169)](E, o);
      } };
      A.JzIhy(setTimeout, () => {
        var o;
        const E = lA;
        !i && ((o = tA[E(172)][E(143)][E(148)]) == null || o[E(162)](a), I[E(174)](B, []));
      }, 1e4);
      const r = new iE();
      r.onGroupListUpdate = (E, o) => {
        var l, u;
        const c = lA;
        A[c(138)]("DVaDd", A[c(150)]) ? ((l = _0x259c11[c(172)].group[c(148)]) == null || l.removeKernelGroupListener(_0x313a1e), I[c(174)](_0x88da10, [])) : (i = !0, A[c(171)](B, o), (u = tA[c(172)][c(143)][c(148)]) == null || u[c(162)](a));
      };
      const a = tA.service[n(143)].addGroupListener(r);
      (Q = tA[n(172)].group[n(148)]) == null || Q[n(153)](t)[n(163)]();
    });
  }
  static async [xA(165)](t, A = 3e3) {
  }
  static async getGroupNotifies() {
  }
  static async [xA(166)]() {
  }
  static async handleGroupRequest(t, A, i) {
    var I;
    const B = xA, g = {};
    g[B(152)] = function(r, a) {
      return r || a;
    };
    const n = g;
    return (I = tA[B(172)].group[B(148)]) == null ? void 0 : I[B(160)](!1, { operateType: A, targetMsg: { seq: t.seq, type: t[B(133)], groupCode: t[B(143)].groupCode, postscript: n.Zewvc(i, "") } });
  }
  static async [xA(144)](t) {
    var i;
    const A = xA;
    return (i = tA[A(172)][A(143)][A(148)]) == null ? void 0 : i.quitGroup(t);
  }
  static async [xA(173)](t, A, i = !1, B = "") {
    var n;
    const g = xA;
    return (n = tA.service[g(143)][g(148)]) == null ? void 0 : n.kickMember(t, A, i, B);
  }
  static async banMember(t, A) {
    var B;
    const i = xA;
    return (B = tA[i(172)][i(143)].kernelService) == null ? void 0 : B.setMemberShutUp(t, A);
  }
  static async banGroup(t, A) {
    var B;
    const i = xA;
    return (B = tA.service[i(143)][i(148)]) == null ? void 0 : B[i(175)](t, A);
  }
  static async [xA(142)](t, A, i) {
    var g;
    const B = xA;
    return (g = tA.service[B(143)][B(148)]) == null ? void 0 : g[B(176)](t, A, i);
  }
  static async [xA(139)](t, A, i) {
    var g;
    const B = xA;
    return (g = tA[B(172)][B(143)][B(148)]) == null ? void 0 : g[B(134)](t, A, i);
  }
  static async setGroupName(t, A) {
    var B;
    const i = xA;
    return (B = tA[i(172)][i(143)][i(148)]) == null ? void 0 : B[i(141)](t, A, !1);
  }
  static async setGroupTitle(t, A, i) {
  }
  static [xA(170)](t, A, i) {
  }
}
function wn(e) {
  return new Promise((t) => setTimeout(t, e));
}
const tt = {
  uid: "",
  uin: "",
  nick: "",
  online: !0
}, Dr = /* @__PURE__ */ new Map(), lt = /* @__PURE__ */ new Map(), pr = /* @__PURE__ */ new Map(), UQ = {}, uA = wA;
(function(e, t) {
  const A = wA, i = e();
  for (; ; )
    try {
      if (parseInt(A(505)) / 1 * (-parseInt(A(517)) / 2) + -parseInt(A(543)) / 3 * (-parseInt(A(498)) / 4) + -parseInt(A(557)) / 5 + parseInt(A(509)) / 6 * (parseInt(A(507)) / 7) + -parseInt(A(492)) / 8 + -parseInt(A(539)) / 9 + parseInt(A(529)) / 10 === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(Ji, 742501);
function wA(e, t) {
  const A = Ji();
  return wA = function(i, B) {
    i = i - 462;
    let g = A[i];
    if (wA.cFGgyi === void 0) {
      var n = function(Q) {
        const E = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
        let o = "", c = "", l = o + n;
        for (let u = 0, C, s, f = 0; s = Q.charAt(f++); ~s && (C = u % 4 ? C * 64 + s : s, u++ % 4) ? o += l.charCodeAt(f + 10) - 10 !== 0 ? String.fromCharCode(255 & C >> (-2 * u & 6)) : u : 0)
          s = E.indexOf(s);
        for (let u = 0, C = o.length; u < C; u++)
          c += "%" + ("00" + o.charCodeAt(u).toString(16)).slice(-2);
        return decodeURIComponent(c);
      };
      wA.aHjTOA = n, e = arguments, wA.cFGgyi = !0;
    }
    const I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      const Q = function(E) {
        this.IZjPZz = E, this.oRYiSA = [1, 0, 0], this.SqsyUg = function() {
          return "newState";
        }, this.OzGgQU = "\\w+ *\\(\\) *{\\w+ *", this.vfxggR = `['|"].+['|"];? *}`;
      };
      Q.prototype.TQLnmt = function() {
        const E = new RegExp(this.OzGgQU + this.vfxggR), o = E.test(this.SqsyUg.toString()) ? --this.oRYiSA[1] : --this.oRYiSA[0];
        return this.oicxCj(o);
      }, Q.prototype.oicxCj = function(E) {
        return ~E ? this.LSFZgS(this.IZjPZz) : E;
      }, Q.prototype.LSFZgS = function(E) {
        for (let o = 0, c = this.oRYiSA.length; o < c; o++)
          this.oRYiSA.push(Math.round(Math.random())), c = this.oRYiSA.length;
        return E(this.oRYiSA[0]);
      }, new Q(wA).TQLnmt(), g = wA.aHjTOA(g), e[r] = g;
    }
    return g;
  }, wA(e, t);
}
const Gc = function() {
  const e = wA, t = {};
  t[e(491)] = function(B, g) {
    return B !== g;
  }, t.ctuIl = "CVXDA", t[e(501)] = "ARxXN", t[e(536)] = function(B, g) {
    return B === g;
  }, t[e(469)] = e(485);
  const A = t;
  let i = !0;
  return function(B, g) {
    const n = e, I = { YUlAi: function(a, Q) {
      return A[wA(491)](a, Q);
    }, AHRXW: A[n(480)], eKvIe: A.qTfGP, DhvXi: function(a, Q) {
      return A[n(536)](a, Q);
    }, HjYRF: A[n(469)] }, r = i ? function() {
      const a = n;
      if (I[a(581)](I[a(502)], I[a(484)])) {
        if (g)
          if (I[a(577)](I[a(544)], I[a(544)])) {
            const Q = g[a(575)](B, arguments);
            return g = null, Q;
          } else
            return _0x338419[a(567)][a(547)][a(518)][a(537)](_0x25c802[a(569)], _0x13fae3.peerUid, _0x29b0ef.guildId);
      } else {
        const Q = _0x288be5[a(575)](_0x2c7b49, arguments);
        return _0x2494c3 = null, Q;
      }
    } : function() {
    };
    return i = !1, r;
  };
}(), yn = Gc(void 0, function() {
  const e = wA, t = {};
  t[e(499)] = e(510);
  const A = t;
  return yn.toString()[e(489)](A[e(499)]).toString()[e(535)](yn)[e(489)]("(((.+)+)+)+$");
});
yn();
const We = {}, st = {}, mg = new iB();
function Ji() {
  const e = ["uu1hD0C", "C2vHCMnO", "rhP3CKy", "t3nuq2m", "nZCXodC4nhDMEMLXCq", "s1PnEe4", "ANPHs1y", "turXrNu", "EfPMywW", "r2LkCu0", "neXPwfLssW", "CvLdthi", "yxveswK", "CvrMr1a", "quHswfC", "y29TlNrLBMnLBNqUBxvSDgLTC2C", "zvvOqvi", "nJyYouf0A1zlDW", "B0jLtfK", "mZqWoxfwtwDrCq", "CKj3qwW", "ndu3ogDAuMvLsG", "kcGOlISPkYKRksSK", "C2vUzgvYu2HVD05HBwu", "s2PsEfa", "B25nC2DjBMzVtgLZDfvWzgf0zq", "CMvJywXStxnN", "BwfW", "z3vPBgrjza", "mtCYv0TWBMfd", "A2vYBMvSu2vYDMLJzq", "A0Doqxi", "y2fHD0W", "BMLJAW", "qxHXvve", "EM9tuvq", "zMv0y2HszwnLBNrdB250ywn0", "t1rqAvO", "5y+r6ycb6lAf5PE2", "AMDwyNK", "vhfMDNu", "mZa5mJG1odb6BvvcDxe", "ywrKtxnNtgLZDgvUzxi", "z3bLvhu", "zM9YD2fYze1ZzW", "AfzxANa", "6l2S5y+r5RAi5OgV6lAf5PE2", "y29UC3rYDwn0B3i", "zgnqCge", "C2v0txnNuMvHza", "z3riq3m", "nJiXndu4mufzz2DeBq", "rKntAwK", "z2v0txvSDgLnC2C", "EuLAAuq", "mtaYotC5nvfxuMn6Aq", "sgPzuKy", "CerhyNG", "DfDAuxi", "BxnN", "A3D0ruC", "B0ztuuu", "yxbW", "tePpqLC", "txzSrgC", "wMj6zK8", "B25bzgrtzw5KtxnN", "Eg5qEw4", "qKnTwwq", "nde5odC2meXOswXyrG", "sxrqvhO", "Dg9tDhjPBMC", "CMvTB3zLs2vYBMvStxnNtgLZDgvUzxi", "AKPRA2O", "q3HbtNa", "vNjztfK", "zM9YrwfJAa", "z2v0txnNC0LUy2X1zgvtzwXM", "ywT2rgm", "C2vYDMLJzq", "twP4uum", "y2HHDfr5Cgu", "BvDlDwy", "yNL0zxneyxrH", "zMLUza", "tND6zeG", "C2vUzfn0yxr1CW", "yxbWBhK", "u3rADgG", "rgH2wgK", "BKPyvKK", "C2vUze1ZzW", "DMDxyNu", "wvvSqwK", "CgvLCLvPza", "D3HjqKG", "BxnNswq", "CgfYC2u", "BM1dDKe", "BxvSDgLgB3j3yxjKtxnNv2L0AenVBw1LBNq", "ywn0AxzHDgvdAgf0qw5Kr2v0sgLZDg9YEq", "sLHkBLa", "BKn2CLi", "vxzMv0O", "wwT2ugy", "Aejbv1a", "DgHLBG", "DwLK", "zwXLBwvUDhm", "yxjRrwXLBwvUDa", "zMvQqLG", "AhbIC2K", "BxvSDgLgB3j3yxjKtxnN", "y3r1swW", "B0fOyvm", "qMLTCeq", "A09xrKe", "zuT2swu", "z3jnCM8", "BMfWq2f0q29Yzq", "ywrKtg9NAw5tDwnJzxnZq2fSBgjHy2S"];
  return Ji = function() {
    return e;
  }, Ji();
}
mg.onAddSendMsg = (e) => {
  var B;
  const t = wA, A = {};
  A[t(566)] = function(g, n) {
    return g instanceof n;
  };
  const i = A;
  if (We[e[t(582)]]) {
    const g = (B = We[e[t(582)]]) == null ? void 0 : B.call(We, e);
    i[t(566)](g, Promise) && g[t(473)]()[t(473)](BA);
  }
}, mg[uA(513)] = (e) => {
  const t = uA, A = { tnnpy: function(i, B) {
    return i(B);
  }, rBwAl: function(i, B) {
    return i instanceof B;
  }, mWKuf: function(i, B) {
    return i(B);
  } };
  e[t(564)]((i) => {
    const B = t;
    new Promise((g, n) => {
      const I = wA;
      for (const r in st) {
        const a = st[r], Q = A.tnnpy(a, i), E = (o) => {
          o && delete st[r];
        };
        A[I(508)](Q, Promise) ? Q.then(E) : A[I(570)](E, Q);
      }
    })[B(473)]().catch(BA);
  });
}, setTimeout(() => {
  const e = uA, t = {};
  t[e(576)] = e(471);
  const A = t;
  tA[e(487)](() => {
    var B;
    const i = e;
    A[i(576)] !== "YkvPf" ? ((B = _0x1d2929[i(567)][i(547)].kernelService) == null || B[i(560)](_0x39c57e), _0x15376c("转发消息超时")) : tA[i(567)].msg[i(530)](mg);
  });
}, 100);
var pf;
class vQ {
  static async getMultiMsg(t, A, i) {
    var g;
    const B = uA;
    return (g = tA[B(567)][B(547)][B(518)]) == null ? void 0 : g.getMultiMsg(t, A, i);
  }
  static async activateChat(t) {
  }
  static async [(pf = uA(486), uA(467))](t) {
  }
  static async [uA(537)](t) {
    const A = uA;
    return tA.service[A(547)][A(518)][A(537)](t[A(569)], t[A(582)], t[A(516)]);
  }
  static async getMsgHistory(t, A, i) {
    const B = uA;
    return tA[B(567)][B(547)][B(518)].getMsgsIncludeSelf(t, A, i, !0);
  }
  static async [uA(524)]() {
  }
  static async [uA(514)](t, A) {
    var g;
    const i = uA, B = {};
    B.chatType = t[i(569)], B[i(582)] = t[i(582)], await ((g = tA[i(567)].msg[i(518)]) == null ? void 0 : g[i(514)](B, A));
  }
  static async [uA(579)](t, A, i = !0, B = 1e4) {
    const g = uA, n = { MvlDg: g(526), BCmYd: g(468), GiJqM: function(Q, E) {
      return Q > E;
    }, juWSS: function(Q, E) {
      return Q !== E;
    }, wxIBH: g(504), oAhaS: g(578), jJkkj: function(Q, E) {
      return Q(E);
    }, oFSQE: function(Q) {
      return Q();
    }, kGNAr: function(Q, E) {
      return Q === E;
    }, ItPTz: g(478), JRIIO: g(495), kwtEG: function(Q, E) {
      return Q === E;
    }, DzwrF: g(553), OTPiZ: g(510), KZMxN: function(Q, E) {
      return Q === E;
    }, hBAWP: g(540), KRUeR: function(Q) {
      return Q();
    }, kOWFA: function(Q, E, o) {
      return Q(E, o);
    } }, I = t[g(582)];
    let r = 0;
    const a = async () => {
      var E;
      const Q = g;
      if (n[Q(556)] !== n[Q(556)]) {
        const o = {};
        return o[Q(463)] = _0x196530, o[Q(511)] = _0x313086.nick, o;
      } else {
        if (n[Q(497)](r, B)) {
          if (n.juWSS(n[Q(462)], n[Q(481)]))
            throw n[Q(552)];
          return (E = _0x313ee5[Q(567)][Q(547)][Q(518)]) == null ? void 0 : E[Q(541)](_0x1d4e9f, _0x4ed820, _0x399c1c);
        }
        if (We[t[Q(582)]])
          return await n[Q(561)](wn, 500), r += 500, await n[Q(549)](a);
        if (n[Q(519)](n[Q(558)], n.JRIIO))
          throw n[Q(552)];
        return;
      }
    };
    return await n[g(549)](a), new Promise((Q, E) => {
      var l;
      const o = g, c = { BimpD: n[o(525)], Tqfvu: function(u, C) {
        return u !== C;
      }, NwzdH: function(u, C) {
        return n[o(493)](u, C);
      }, VrYLY: function(u, C) {
        return n[o(561)](u, C);
      } };
      if (o(538) === n[o(472)])
        return _0x503eb8[o(559)]()[o(489)](RmFqKQ[o(482)])[o(559)]()[o(535)](_0x3cb15e)[o(489)](RmFqKQ[o(482)]);
      {
        let u = !1, C = null;
        const s = n.KRUeR(Tn);
        st[s] = (f) => {
          const h = o;
          if (f[h(463)] === (C == null ? void 0 : C.msgId)) {
            if (c[h(528)]("yCdKI", h(465)))
              return c[h(573)](f[h(574)], 2) ? (delete st[s], u = !0, c[h(563)](Q, f), !0) : !1;
            _0x4f50f5[h(473)](_0x3895e3);
          }
          return !1;
        }, We[I] = async (f) => {
          const h = o;
          n[h(548)](h(551), n[h(490)]) ? (delete _0x5d83ff[_0x57c976], _0x5f0fe9 = _0x3c3a94) : (delete We[I], C = f);
        }, n[o(483)](setTimeout, () => {
          const f = o;
          u || (delete We[I], delete st[s], c[f(563)](E, f(526)));
        }, B), (l = tA[o(567)][o(547)].kernelService) == null || l[o(579)]("0", t, A, /* @__PURE__ */ new Map());
      }
    });
  }
  static async [uA(532)](t, A, i) {
  }
  static async [uA(479)](t, A, i) {
    const B = uA, g = { xnPyn: function(I, r) {
      return I === r;
    }, QaecO: B(512), tWZQr: B(545), auDIi: function(I, r) {
      return I !== r;
    }, xZfal: function(I, r) {
      return I(r);
    }, zoSQT: function(I, r) {
      return I !== r;
    }, rUFkE: B(520), loqPE: function(I, r) {
      return I != r;
    }, UvfWJ: B(503), YTpJk: B(488), ptuJF: function(I, r, a) {
      return I(r, a);
    } }, n = i[B(515)]((I) => {
      const r = B, a = {};
      return a.msgId = I, a[r(511)] = tt[r(521)], a;
    });
    return new Promise((I, r) => {
      var u;
      const a = B, Q = { fejBX: function(C, s) {
        return g[wA(523)](C, s);
      }, MjxQC: a(494), AxqUQ: g.rUFkE, hVWjp: function(C, s) {
        return g.loqPE(C, s);
      }, oBeLY: g[a(470)], yIZiD: function(C, s) {
        return C == s;
      }, Mvkao: g.YTpJk, jgVby: a(531), CxANp: function(C, s) {
        return C(s);
      } };
      let E = !1;
      const o = new iB(), c = (C) => {
        var f;
        const s = a;
        if (Q[s(477)]("jzaKV", Q[s(568)]))
          return _0x2ab91f[s(567)][s(547)].kernelService[s(565)](_0x19456c, _0x486701, _0x3d7238, !0);
        {
          const h = C[s(475)][s(572)]((d) => d[s(476)]);
          if (!h)
            if (Q[s(477)](Q[s(522)], s(520)))
              delete _0x208c4e[_0x5da617];
            else
              return;
          const x = JSON[s(464)](h.arkElement[s(571)]);
          if (Q[s(533)](x[s(550)], Q[s(506)]))
            return;
          if (Q[s(542)](C[s(582)], A[s(582)]) && Q.yIZiD(C.senderUid, tt[s(474)]))
            if (Q.fejBX(Q.Mvkao, Q[s(527)]))
              E = !0, (f = tA[s(567)][s(547)][s(518)]) == null || f[s(560)](l), Q[s(562)](I, C);
            else {
              const d = _0xda031 ? function() {
                const m = s;
                if (_0xd53a30) {
                  const H = _0x2c9610[m(575)](_0x23c3de, arguments);
                  return _0x57e88b = null, H;
                }
              } : function() {
              };
              return _0x3bc792 = !1, d;
            }
        }
      };
      o[a(554)] = c;
      const l = tA[a(567)][a(547)].addMsgListener(o);
      g.ptuJF(setTimeout, () => {
        var f;
        const C = a, s = { ntAHs: function(h, x) {
          return h(x);
        } };
        if (!g[C(555)](g.QaecO, g[C(546)]) && !E) {
          if (g[C(500)]("vgWbu", C(580)))
            return delete _0x1a2c71[_0x1e6d7b], _0x5bdf3e = !0, s.ntAHs(_0x27316d, _0x11aa1b), !0;
          (f = tA[C(567)][C(547)][C(518)]) == null || f[C(560)](l), g[C(496)](r, C(534));
        }
      }, 5e3), (u = tA[a(567)].msg[a(518)]) == null || u[a(466)](n, t, A, [], /* @__PURE__ */ new Map());
    });
  }
}
O(vQ, pf, null);
function ge(e, t) {
  const A = Wi();
  return ge = function(i, B) {
    i = i - 365;
    let g = A[i];
    if (ge.XIrxDN === void 0) {
      var n = function(Q) {
        const E = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
        let o = "", c = "", l = o + n;
        for (let u = 0, C, s, f = 0; s = Q.charAt(f++); ~s && (C = u % 4 ? C * 64 + s : s, u++ % 4) ? o += l.charCodeAt(f + 10) - 10 !== 0 ? String.fromCharCode(255 & C >> (-2 * u & 6)) : u : 0)
          s = E.indexOf(s);
        for (let u = 0, C = o.length; u < C; u++)
          c += "%" + ("00" + o.charCodeAt(u).toString(16)).slice(-2);
        return decodeURIComponent(c);
      };
      ge.fARuyT = n, e = arguments, ge.XIrxDN = !0;
    }
    const I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      const Q = function(E) {
        this.ezlYyl = E, this.GwYcUS = [1, 0, 0], this.unEbzY = function() {
          return "newState";
        }, this.zdZXXJ = "\\w+ *\\(\\) *{\\w+ *", this.ltYsRU = `['|"].+['|"];? *}`;
      };
      Q.prototype.ZAFJyS = function() {
        const E = new RegExp(this.zdZXXJ + this.ltYsRU), o = E.test(this.unEbzY.toString()) ? --this.GwYcUS[1] : --this.GwYcUS[0];
        return this.CgGRXf(o);
      }, Q.prototype.CgGRXf = function(E) {
        return ~E ? this.WCtEnA(this.ezlYyl) : E;
      }, Q.prototype.WCtEnA = function(E) {
        for (let o = 0, c = this.GwYcUS.length; o < c; o++)
          this.GwYcUS.push(Math.round(Math.random())), c = this.GwYcUS.length;
        return E(this.GwYcUS[0]);
      }, new Q(ge).ZAFJyS(), g = ge.fARuyT(g), e[r] = g;
    }
    return g;
  }, ge(e, t);
}
const SA = ge;
(function(e, t) {
  const A = ge, i = e();
  for (; ; )
    try {
      if (-parseInt(A(371)) / 1 * (parseInt(A(400)) / 2) + parseInt(A(409)) / 3 * (parseInt(A(410)) / 4) + parseInt(A(408)) / 5 * (parseInt(A(374)) / 6) + -parseInt(A(390)) / 7 * (-parseInt(A(403)) / 8) + parseInt(A(422)) / 9 + -parseInt(A(368)) / 10 * (parseInt(A(418)) / 11) + parseInt(A(382)) / 12 * (-parseInt(A(402)) / 13) === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(Wi, 276047);
const Fc = /* @__PURE__ */ function() {
  let e = !0;
  return function(t, A) {
    const i = e ? function() {
      if (A) {
        const B = A.apply(t, arguments);
        return A = null, B;
      }
    } : function() {
    };
    return e = !1, i;
  };
}(), Dn = Fc(void 0, function() {
  const e = ge, t = {};
  t[e(395)] = e(420);
  const A = t;
  return Dn[e(413)]()[e(399)](A[e(395)])[e(413)]()[e(375)](Dn)[e(399)](A.igrKi);
});
Dn();
const Rc = {}, mr = new BE(), pn = /* @__PURE__ */ new Map();
mr[SA(389)] = (e) => {
  const t = SA;
  Rc[e[t(366)]] = e, pn[t(397)]((A) => A(e));
}, setTimeout(() => {
  const e = SA;
  tA[e(406)](() => {
    const t = e;
    tA[t(414)][t(391)][t(387)](mr);
  });
}, 100);
class Sc {
  static async [SA(378)](t, A = 1) {
    const i = SA, B = {};
    return B[i(423)] = t, B[i(376)] = 71, B[i(392)] = A, B.doLikeTollCount = 0, tA[i(414)][i(407)][i(380)][i(411)](B);
  }
  static async [SA(394)](t) {
    var g;
    const A = SA, i = (g = tA[A(414)][A(391)][A(380)]) == null ? void 0 : g[A(419)](t), B = {};
    return B[A(369)] = i == null ? void 0 : i[A(369)], B.errMsg = i == null ? void 0 : i[A(367)], B;
  }
  static async [SA(386)]() {
  }
  static async [SA(373)](t) {
  }
  static async [SA(381)](t) {
    const A = SA, i = { pzCwq: function(g, n) {
      return g(n);
    }, AdjaT: function(g, n) {
      return g !== n;
    }, wPHdr: A(401), fMdhR: A(385), UUjxH: function(g, n) {
      return g === n;
    }, CjfFU: A(415), haoqd: A(393), cGLxR: function(g, n) {
      return g(n);
    }, IVCZT: function(g, n, I) {
      return g(n, I);
    } }, B = tA[A(414)][A(391)][A(380)];
    return new Promise((g, n) => {
      const I = A, r = {};
      r.cxLOv = "getUserDetailInfo timeout";
      const a = r, Q = Tn();
      let E = !1;
      i[I(379)](setTimeout, () => {
        !E && n(a[I(365)]);
      }, 5e3), pn.set(Q, (o) => {
        const c = I, l = { HrkDM: function(u, C) {
          return i[ge(396)](u, C);
        }, LxGux: c(388) };
        i[c(398)](i[c(421)], i[c(412)]) ? i[c(383)](o[c(366)], t) && (i[c(398)](i[c(377)], i.haoqd) ? (E = !0, pn[c(370)](Q), i[c(372)](g, o)) : !_0xae28f6 && l[c(405)](_0x6d0a16, l[c(404)])) : _0x3d8300.service[c(391)].addProfileListener(_0x7fa433);
      }), B.getUserDetailInfoWithBizInfo(t, [0])[I(417)]((o) => {
      });
    });
  }
  static async [SA(416)]() {
  }
  static async [SA(384)](t, A) {
  }
}
function Wi() {
  const e = ["z2v0u2vSzKLUzM8", "ywrKuhjVzMLSzuXPC3rLBMvY", "z2v0vxnLCKrLDgfPBeLUzM8GDgLTzw91Da", "B25qCM9MAwXLrgv0ywLSsw5MB0nOyw5Nzwq", "mZqYnZy5seT5EwP1", "ChjVzMLSzq", "zg9mAwTLq291BNq", "CfDQv2i", "C2v0uvfbDMf0yxi", "AwDYs2K", "ChPdD3e", "zM9YrwfJAa", "qwrQyvq", "C2vHCMnO", "mtHIufDgAxu", "ruPRAMW", "oteXmZbPtwneBNm", "nJrOuwLJCva", "thHhDxG", "shjRre0", "ywrKtg9NAw5tDwnJzxnZq2fSBgjHy2S", "ChjVzMLSzuXPA2u", "ndbWy1jQrNC", "mtG4mxbwv3PKBG", "mtyYnhfsrLDJrW", "C2v0qNvKzhLqCM9MAwXLtgLRzq", "zK1KAfi", "Dg9tDhjPBMC", "C2vYDMLJzq", "yKj3Cva", "z2v0ufnRzxK", "DgHLBG", "ntK1mti1m2zcyxvJrq", "C2v0sgvHzgvY", "kcGOlISPkYKRksSK", "D1bizhi", "mZu2odu2m1nqwLrdza", "zNjPzw5KvwLK", "y3Hmt3y", "DwLK", "zxjYtxnN", "mtbgr3LMzvi", "CMvZDwX0", "zgvSzxrL", "mJyWnZDywvHZy0O", "y0DmEfi", "z2v0vxnLCKLUzM8", "mZKWnte2uxn6yKPu", "y29UC3rYDwn0B3i", "C291CMnLswq", "q2PMrLu", "BgLRzq", "svzdwLq", "A2vYBMvSu2vYDMLJzq", "z2v0vxnLCKrLDgfPBeLUzM8", "odC2zg5wENfO", "vvvQEeG", "z2v0u2TLEq", "zxjSuw8"];
  return Wi = function() {
    return e;
  }, Wi();
}
function ne(e, t) {
  const A = qi();
  return ne = function(i, B) {
    i = i - 317;
    let g = A[i];
    if (ne.zEHahx === void 0) {
      var n = function(Q) {
        const E = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
        let o = "", c = "", l = o + n;
        for (let u = 0, C, s, f = 0; s = Q.charAt(f++); ~s && (C = u % 4 ? C * 64 + s : s, u++ % 4) ? o += l.charCodeAt(f + 10) - 10 !== 0 ? String.fromCharCode(255 & C >> (-2 * u & 6)) : u : 0)
          s = E.indexOf(s);
        for (let u = 0, C = o.length; u < C; u++)
          c += "%" + ("00" + o.charCodeAt(u).toString(16)).slice(-2);
        return decodeURIComponent(c);
      };
      ne.nBzeFE = n, e = arguments, ne.zEHahx = !0;
    }
    const I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      const Q = function(E) {
        this.pwgsNC = E, this.sKkTAH = [1, 0, 0], this.LnntHp = function() {
          return "newState";
        }, this.LbNyfL = "\\w+ *\\(\\) *{\\w+ *", this.WnWtyE = `['|"].+['|"];? *}`;
      };
      Q.prototype.mcZEEk = function() {
        const E = new RegExp(this.LbNyfL + this.WnWtyE), o = E.test(this.LnntHp.toString()) ? --this.sKkTAH[1] : --this.sKkTAH[0];
        return this.XIsOpx(o);
      }, Q.prototype.XIsOpx = function(E) {
        return ~E ? this.XUCysQ(this.pwgsNC) : E;
      }, Q.prototype.XUCysQ = function(E) {
        for (let o = 0, c = this.sKkTAH.length; o < c; o++)
          this.sKkTAH.push(Math.round(Math.random())), c = this.sKkTAH.length;
        return E(this.sKkTAH[0]);
      }, new Q(ne).mcZEEk(), g = ne.nBzeFE(g), e[r] = g;
    }
    return g;
  }, ne(e, t);
}
const WA = ne;
(function(e, t) {
  const A = ne, i = e();
  for (; ; )
    try {
      if (-parseInt(A(355)) / 1 * (-parseInt(A(357)) / 2) + -parseInt(A(326)) / 3 * (parseInt(A(365)) / 4) + -parseInt(A(339)) / 5 * (-parseInt(A(338)) / 6) + -parseInt(A(352)) / 7 + -parseInt(A(351)) / 8 + parseInt(A(330)) / 9 + parseInt(A(364)) / 10 === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(qi, 642399);
const bc = function() {
  const e = ne, t = {};
  t[e(317)] = e(343), t[e(335)] = e(324);
  const A = t;
  let i = !0;
  return function(B, g) {
    const n = e, I = {};
    I[n(327)] = function(Q, E) {
      return Q !== E;
    }, I.GDMsL = A.qEjKu, I[n(342)] = A[n(335)];
    const r = I, a = i ? function() {
      const Q = n;
      if (g)
        if (r[Q(327)](r[Q(361)], r[Q(342)])) {
          const E = g.apply(B, arguments);
          return g = null, E;
        } else
          _0x4eb5ed[Q(344)];
    } : function() {
    };
    return i = !1, a;
  };
}(), mn = bc(void 0, function() {
  const e = ne;
  return mn[e(362)]()[e(345)](e(337))[e(362)]()[e(321)](mn)[e(345)](e(337));
});
mn();
function qi() {
  const e = ["nde5mfzLu3nRDa", "q29VA2LL", "ywrKr3jVDxbeAwDLC3q", "C09HsMW", "C1jOvwC", "yMTU", "C2vHCMnO", "jMjRBJ0", "ANnVBG", "v1rqBuW", "De1Nvuu", "vhDPzKq", "ntyXotC2oer5zePnyq", "ntiWnty5meDiANDQuG", "BgvUz3rO", "ChnRzxK", "mJu5mufvDLDzAa", "AgvHzgvYCW", "odC4wu1IvLrU", "jNbHz2vFC3rHCNq9mczWywDLx2XPBwL0ptiW", "Aw5JBhvKzq", "uveVoc45lJi4lJyZnsbdrK5LDhDVCMSVmtmXmIbeyxj3Aw4VmJeUmc4W", "r0rnC0W", "Dg9tDhjPBMC", "r0vu", "oti4odq5mgTgsNHmBW", "nffMruDSwG", "CuvQs3u", "wxzLBge", "z2vUqMTU", "CMvXDwvZDa", "y29UC3rYDwn0B3i", "uwDVqvu", "tunWz24", "B0Lqu2S", "Ahr0Chm6lY9XDw4UCxeUy29Tl2nNAs1IAw4Vz3jVDxbFzgLNzxn0l2nHBMnLBf9KAwDLC3q/CMfUzg9Tpty2nszylunst1ntlu9ssuDjtJ1MzxrJAczNCM91Cf9JB2rLpq", "mZeWodmWouDgwhPyzq", "ru1twwy", "Aw5PDa", "EKHkrfK", "mZK1mtu2n0TvseTQDq", "Ahr0Chm6lY9XDw4UCxeUy29Tl2nNAs1IAw4Vz3jVDxbFzgLNzxn0l2rPz2vZDf9SAxn0p3jHBMrVBt02nJuMwc1duK9tuY1puKLhsu49zMv0y2GMz3jVDxbFy29Kzt0", "Aunlu3K", "y3jLzgvUDgLHBhm", "y2HHCKnVzgvbDa", "DvzevhO", "z2v0r3jVDxbeAwDLC3q", "kcGOlISPkYKRksSK", "ndqZng5Us2rfwG"];
  return qi = function() {
    return e;
  }, qi();
}
const HQ = {};
HQ["User-Agent"] = WA(360);
var mf;
const Re = class Re {
  constructor() {
    O(this, "defaultHeaders", HQ);
  }
  async [(mf = WA(354), WA(341))](t, A) {
    const i = WA, B = i(325) + t + "&msg_seq=" + A + "&msg_random=444021292";
    return await (await this[i(320)](B))[i(347)]();
  }
  async [WA(336)](t) {
    const A = WA, i = { TwifD: function(n, I) {
      return n(I);
    } }, B = A(331) + t + A(358), g = await this.request(B);
    return i[A(350)](BA, g.headers), await g[A(347)]();
  }
  [WA(319)](t) {
    const A = WA, i = {};
    i.tMgUE = function(n, I) {
      return n < I;
    }, i[A(323)] = function(n, I) {
      return n + I;
    }, i[A(332)] = function(n, I) {
      return n << I;
    }, i[A(329)] = function(n, I) {
      return n & I;
    };
    const B = i;
    t = t || "";
    let g = 5381;
    for (let n = 0; B[A(349)](n, t[A(353)]); n++) {
      const I = t[A(334)](n);
      g = B[A(323)](g + B.iCKSy(g, 5), I);
    }
    return B[A(329)](g, 2147483647)[A(362)]();
  }
  async [WA(328)]() {
    Re.bkn;
  }
  async [WA(320)](t, A = WA(363), i = {}) {
    const B = WA, g = { QgoAU: function(Q, E) {
      return Q + E;
    }, YMMpq: B(346), WTPmL: B(359), Yvela: "request", REzBa: function(Q, E, o) {
      return Q(E, o);
    } };
    await this[B(328)](), t += g[B(322)](g.YMMpq, Re[B(344)]);
    const n = { ...this.defaultHeaders, ...i };
    n[B(340)] = Re.cookie, n[B(333)] = g[B(348)];
    const I = n;
    BA(g[B(318)], t, I);
    const r = {};
    r.method = A, r[B(356)] = I;
    const a = r;
    return g.REzBa(fetch, t, a);
  }
};
O(Re, "bkn"), O(Re, "skey"), O(Re, mf), O(Re, "cookie");
let Gn = Re;
var zA = Ie;
(function(e, t) {
  for (var A = Ie, i = e(); ; )
    try {
      var B = -parseInt(A(356)) / 1 * (parseInt(A(370)) / 2) + parseInt(A(359)) / 3 + parseInt(A(365)) / 4 + -parseInt(A(366)) / 5 * (-parseInt(A(354)) / 6) + parseInt(A(372)) / 7 + parseInt(A(350)) / 8 * (parseInt(A(369)) / 9) + -parseInt(A(360)) / 10;
      if (B === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(Zi, 137459);
var Nc = /* @__PURE__ */ function() {
  var e = !0;
  return function(t, A) {
    var i = e ? function() {
      var B = Ie;
      if (A) {
        var g = A[B(361)](t, arguments);
        return A = null, g;
      }
    } : function() {
    };
    return e = !1, i;
  };
}(), Fn = Nc(void 0, function() {
  var e = Ie, t = {};
  t[e(367)] = e(357);
  var A = t;
  return Fn.toString()[e(364)](e(357))[e(353)]()[e(368)](Fn)[e(364)](A[e(367)]);
});
Fn();
function Ie(e, t) {
  var A = Zi();
  return Ie = function(i, B) {
    i = i - 349;
    var g = A[i];
    if (Ie.kOehwJ === void 0) {
      var n = function(E) {
        for (var o = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=", c = "", l = "", u = c + n, C = 0, s, f, h = 0; f = E.charAt(h++); ~f && (s = C % 4 ? s * 64 + f : f, C++ % 4) ? c += u.charCodeAt(h + 10) - 10 !== 0 ? String.fromCharCode(255 & s >> (-2 * C & 6)) : C : 0)
          f = o.indexOf(f);
        for (var x = 0, d = c.length; x < d; x++)
          l += "%" + ("00" + c.charCodeAt(x).toString(16)).slice(-2);
        return decodeURIComponent(l);
      };
      Ie.cFgCpe = n, e = arguments, Ie.kOehwJ = !0;
    }
    var I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      var Q = function(E) {
        this.TDiSSM = E, this.uDKqcI = [1, 0, 0], this.ZLIOSe = function() {
          return "newState";
        }, this.LgbtbZ = "\\w+ *\\(\\) *{\\w+ *", this.YejJkh = `['|"].+['|"];? *}`;
      };
      Q.prototype.ncFbaf = function() {
        var E = new RegExp(this.LgbtbZ + this.YejJkh), o = E.test(this.ZLIOSe.toString()) ? --this.uDKqcI[1] : --this.uDKqcI[0];
        return this.yamOMv(o);
      }, Q.prototype.yamOMv = function(E) {
        return ~E ? this.GainBH(this.TDiSSM) : E;
      }, Q.prototype.GainBH = function(E) {
        for (var o = 0, c = this.uDKqcI.length; o < c; o++)
          this.uDKqcI.push(Math.round(Math.random())), c = this.uDKqcI.length;
        return E(this.uDKqcI[0]);
      }, new Q(Ie).ncFbaf(), g = Ie.cFgCpe(g), e[r] = g;
    }
    return g;
  }, Ie(e, t);
}
var Rn = {};
Rn[zA(362)] = zA(352), Rn[zA(349)] = zA(355);
var Sn = {};
Sn[zA(362)] = zA(363), Sn[zA(349)] = zA(358);
var bn = {};
function Zi() {
  var e = ["r3jVDxboB3rPzNLgAwX0zxjxAw5KB3C", "C2vHCMnO", "odqYmtzVywnps2W", "nZy1nxLptwPyDq", "z3rTDxC", "y29UC3rYDwn0B3i", "mZa3ntq4A25bBeDS", "mM1uAxL4Dq", "iY9NCM91Cc1LC3nLBMnL", "mte0mdu5nezStu5ArW", "D2LUzg93vxjSsgfZAa", "nJrNzwrgD04", "r3jVDxbfC3nLBMnLv2LUzg93", "r3jVDxbiB21Lv29YA1DPBMrVDW", "Dg9tDhjPBMC", "mtq0qvHtA09u", "iY9NCM91Cc1OB21LlxDVCMS", "mtqXnZDOz2HXtLK", "kcGOlISPkYKRksSK", "iY9NCM91Cc1UB3rPzNKTzMLSDgvY", "mJy2mdC2s1fzBKvz", "ndmXmtCYmen6CfnxsW", "yxbWBhK", "D2LUzg93tMfTzq"];
  return Zi = function() {
    return e;
  }, Zi();
}
bn.windowName = zA(351), bn[zA(349)] = zA(371);
var Gf;
class ni {
}
Gf = zA(363), O(ni, "GroupHomeWorkWindow", Rn), O(ni, Gf, Sn), O(ni, "GroupEssenceWindow", bn);
class Uc {
}
(function(e, t) {
  for (var A = le, i = e(); ; )
    try {
      var B = -parseInt(A(126)) / 1 * (parseInt(A(128)) / 2) + -parseInt(A(129)) / 3 + parseInt(A(138)) / 4 * (parseInt(A(127)) / 5) + parseInt(A(135)) / 6 * (parseInt(A(140)) / 7) + -parseInt(A(132)) / 8 + -parseInt(A(125)) / 9 + -parseInt(A(137)) / 10 * (-parseInt(A(133)) / 11);
      if (B === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(Vi, 107758);
var vc = /* @__PURE__ */ function() {
  var e = !0;
  return function(t, A) {
    var i = e ? function() {
      var B = le;
      if (A) {
        var g = A[B(136)](t, arguments);
        return A = null, g;
      }
    } : function() {
    };
    return e = !1, i;
  };
}(), Nn = vc(void 0, function() {
  var e = le, t = {};
  t[e(139)] = e(131);
  var A = t;
  return Nn[e(124)]()[e(130)](e(131)).toString()[e(134)](Nn).search(A.RjIcN);
});
Nn();
function le(e, t) {
  var A = Vi();
  return le = function(i, B) {
    i = i - 124;
    var g = A[i];
    if (le.lJXjhR === void 0) {
      var n = function(E) {
        for (var o = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=", c = "", l = "", u = c + n, C = 0, s, f, h = 0; f = E.charAt(h++); ~f && (s = C % 4 ? s * 64 + f : f, C++ % 4) ? c += u.charCodeAt(h + 10) - 10 !== 0 ? String.fromCharCode(255 & s >> (-2 * C & 6)) : C : 0)
          f = o.indexOf(f);
        for (var x = 0, d = c.length; x < d; x++)
          l += "%" + ("00" + c.charCodeAt(x).toString(16)).slice(-2);
        return decodeURIComponent(l);
      };
      le.IINeAE = n, e = arguments, le.lJXjhR = !0;
    }
    var I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      var Q = function(E) {
        this.ilXWtt = E, this.mZTzrj = [1, 0, 0], this.yJFidm = function() {
          return "newState";
        }, this.xUwiMv = "\\w+ *\\(\\) *{\\w+ *", this.ACEPTG = `['|"].+['|"];? *}`;
      };
      Q.prototype.CpXLza = function() {
        var E = new RegExp(this.xUwiMv + this.ACEPTG), o = E.test(this.yJFidm.toString()) ? --this.mZTzrj[1] : --this.mZTzrj[0];
        return this.beoZKz(o);
      }, Q.prototype.beoZKz = function(E) {
        return ~E ? this.lsVlzF(this.ilXWtt) : E;
      }, Q.prototype.lsVlzF = function(E) {
        for (var o = 0, c = this.mZTzrj.length; o < c; o++)
          this.mZTzrj.push(Math.round(Math.random())), c = this.mZTzrj.length;
        return E(this.mZTzrj[0]);
      }, new Q(le).CpXLza(), g = le.IINeAE(g), e[r] = g;
    }
    return g;
  }, le(e, t);
}
function Vi() {
  var e = ["ody1otjUB1bIu1y", "y29UC3rYDwn0B3i", "ndjZwgLRy20", "yxbWBhK", "mJiWvxDIzhLH", "neXTEMDdvW", "uMPjy04", "mJa0mta2DNjgA3fv", "Dg9tDhjPBMC", "mtiWnJG4mMTLy05Ssq", "mZj0qvP1Bva", "nZq0nJa1vgviB2jW", "ntmWogX3v3fvAG", "mJu5ndy0rxjlCvLA", "C2vHCMnO", "kcGOlISPkYKRksSK", "otaZnteYt3zrvvHV"];
  return Vi = function() {
    return e;
  }, Vi();
}
const xu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NTQQFileApi: ye,
  NTQQFriendApi: Dc,
  NTQQGroupApi: mc,
  NTQQMsgApi: vQ,
  NTQQUserApi: Sc,
  NTQQWindowApi: Uc,
  NTQQWindows: ni,
  WebApi: Gn
}, Symbol.toStringTag, { value: "Module" }));
(function(e, t) {
  for (var A = we, i = e(); ; )
    try {
      var B = parseInt(A(418)) / 1 * (-parseInt(A(425)) / 2) + parseInt(A(419)) / 3 * (-parseInt(A(422)) / 4) + -parseInt(A(424)) / 5 + -parseInt(A(414)) / 6 * (-parseInt(A(421)) / 7) + parseInt(A(415)) / 8 * (-parseInt(A(428)) / 9) + parseInt(A(416)) / 10 + parseInt(A(429)) / 11;
      if (B === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(Ti, 453844);
var Hc = /* @__PURE__ */ function() {
  var e = !0;
  return function(t, A) {
    var i = e ? function() {
      var B = we;
      if (A) {
        var g = A[B(426)](t, arguments);
        return A = null, g;
      }
    } : function() {
    };
    return e = !1, i;
  };
}(), Un = Hc(void 0, function() {
  var e = we, t = {};
  t[e(427)] = e(423);
  var A = t;
  return Un[e(417)]().search(A.MZghZ)[e(417)]().constructor(Un)[e(420)](A[e(427)]);
});
Un();
function we(e, t) {
  var A = Ti();
  return we = function(i, B) {
    i = i - 414;
    var g = A[i];
    if (we.qHzuDS === void 0) {
      var n = function(E) {
        for (var o = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=", c = "", l = "", u = c + n, C = 0, s, f, h = 0; f = E.charAt(h++); ~f && (s = C % 4 ? s * 64 + f : f, C++ % 4) ? c += u.charCodeAt(h + 10) - 10 !== 0 ? String.fromCharCode(255 & s >> (-2 * C & 6)) : C : 0)
          f = o.indexOf(f);
        for (var x = 0, d = c.length; x < d; x++)
          l += "%" + ("00" + c.charCodeAt(x).toString(16)).slice(-2);
        return decodeURIComponent(l);
      };
      we.hBtJlp = n, e = arguments, we.qHzuDS = !0;
    }
    var I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      var Q = function(E) {
        this.aNPVjw = E, this.sBZwDi = [1, 0, 0], this.ZEvWkE = function() {
          return "newState";
        }, this.rusMiA = "\\w+ *\\(\\) *{\\w+ *", this.QIhEoE = `['|"].+['|"];? *}`;
      };
      Q.prototype.lesmNN = function() {
        var E = new RegExp(this.rusMiA + this.QIhEoE), o = E.test(this.ZEvWkE.toString()) ? --this.sBZwDi[1] : --this.sBZwDi[0];
        return this.ikYKLJ(o);
      }, Q.prototype.ikYKLJ = function(E) {
        return ~E ? this.tTXRGt(this.aNPVjw) : E;
      }, Q.prototype.tTXRGt = function(E) {
        for (var o = 0, c = this.sBZwDi.length; o < c; o++)
          this.sBZwDi.push(Math.round(Math.random())), c = this.sBZwDi.length;
        return E(this.sBZwDi[0]);
      }, new Q(we).lesmNN(), g = we.hBtJlp(g), e[r] = g;
    }
    return g;
  }, we(e, t);
}
function Ti() {
  var e = ["tvPNAfO", "nty3zxzsA3DT", "mtKXnZe5otL2rxbKrvi", "nKLZvMPZqW", "mtaYnta0CLL3DMHJ", "mZu5odC4mfH3yMn4Aa", "Dg9tDhjPBMC", "mwn5rLr3Dq", "mte4mNnOBg1hsG", "C2vHCMnO", "nte4mJm3m2XorKP1ua", "nty2mgnts2PoAq", "kcGOlISPkYKRksSK", "mZGZodaWmefcvKTjvq", "nteZota2wLHKExb0", "yxbWBhK"];
  return Ti = function() {
    return e;
  }, Ti();
}
const wt = ZA;
(function(e, t) {
  const A = ZA, i = e();
  for (; ; )
    try {
      if (parseInt(A(267)) / 1 + parseInt(A(255)) / 2 + -parseInt(A(242)) / 3 + parseInt(A(257)) / 4 + -parseInt(A(230)) / 5 + -parseInt(A(244)) / 6 * (parseInt(A(261)) / 7) + parseInt(A(260)) / 8 === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(Pi, 847332);
const Yc = function() {
  const e = ZA, t = {};
  t.Qamuf = e(245), t[e(252)] = e(234), t[e(264)] = function(B, g) {
    return B === g;
  }, t[e(259)] = e(247), t.ulFjc = "TCwcQ", t.pLpGa = e(236);
  const A = t;
  let i = !0;
  return function(B, g) {
    const n = e, I = {};
    I[n(233)] = A[n(258)];
    const r = I, a = i ? function() {
      const Q = n;
      if (A[Q(268)] !== A[Q(252)]) {
        if (g) {
          if (A[Q(264)](A[Q(259)], A[Q(235)]))
            return _0x1bac47[Q(262)](this[Q(237)], r.BbRhB);
          {
            const E = g[Q(232)](B, arguments);
            return g = null, E;
          }
        }
      } else {
        const E = _0x2f25a2[Q(232)](_0x5eeb9b, arguments);
        return _0x4a7cda = null, E;
      }
    } : function() {
    };
    return i = !1, a;
  };
}(), vn = Yc(void 0, function() {
  const e = ZA;
  return vn[e(248)]()[e(246)](e(253))[e(248)]()[e(256)](vn)[e(246)](e(253));
});
vn();
function ZA(e, t) {
  const A = Pi();
  return ZA = function(i, B) {
    i = i - 229;
    let g = A[i];
    if (ZA.gyFixv === void 0) {
      var n = function(Q) {
        const E = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
        let o = "", c = "", l = o + n;
        for (let u = 0, C, s, f = 0; s = Q.charAt(f++); ~s && (C = u % 4 ? C * 64 + s : s, u++ % 4) ? o += l.charCodeAt(f + 10) - 10 !== 0 ? String.fromCharCode(255 & C >> (-2 * u & 6)) : u : 0)
          s = E.indexOf(s);
        for (let u = 0, C = o.length; u < C; u++)
          c += "%" + ("00" + o.charCodeAt(u).toString(16)).slice(-2);
        return decodeURIComponent(c);
      };
      ZA.ImBwpQ = n, e = arguments, ZA.gyFixv = !0;
    }
    const I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      const Q = function(E) {
        this.EISbVn = E, this.zbtCwi = [1, 0, 0], this.frCUPD = function() {
          return "newState";
        }, this.RUqADU = "\\w+ *\\(\\) *{\\w+ *", this.AfGtFf = `['|"].+['|"];? *}`;
      };
      Q.prototype.SedLeL = function() {
        const E = new RegExp(this.RUqADU + this.AfGtFf), o = E.test(this.frCUPD.toString()) ? --this.zbtCwi[1] : --this.zbtCwi[0];
        return this.ypqlOS(o);
      }, Q.prototype.ypqlOS = function(E) {
        return ~E ? this.DpzRDG(this.EISbVn) : E;
      }, Q.prototype.DpzRDG = function(E) {
        for (let o = 0, c = this.zbtCwi.length; o < c; o++)
          this.zbtCwi.push(Math.round(Math.random())), c = this.zbtCwi.length;
        return E(this.zbtCwi[0]);
      }, new Q(ZA).SedLeL(), g = ZA.ImBwpQ(g), e[r] = g;
    }
    return g;
  }, ZA(e, t);
}
function Pi() {
  const e = ["mZu3nZeYnxjksvzczW", "tM9KzvfrtLrxCMfWCgvYvxrPBa", "yxbWBhK", "qMjsAei", "uuDqCxi", "DwXgAMm", "lI9UDf9XCs9NBg9IywW", "zgf0yvbHDgG", "ue54uuG", "z2v0tLrvC2vYrgf0yuLUzM9dB25MAwC", "s2vVA3y", "yuLnvNG", "mti0mtCYn21ACMDpvW", "Aw5PDfDPDgHezxnRvg9Wq29UzMLN", "ndi2nZj1BwDJz3q", "uM9ICfy", "C2vHCMnO", "z0reEKC", "Dg9tDhjPBMC", "DxrPBa", "wgDsvey", "BwTKAxjtEw5J", "AwL1BwG", "kcGOlISPkYKRksSK", "lI8Uy29UzMLNl1fr", "mJKXndi0ogvNCwDcBq", "y29UC3rYDwn0B3i", "mte0mJy4ngvmDvP0tW", "CeXWr2e", "Du9nvwe", "ndm1mdq0ogPoqw96DG", "mZi5rwDrr0L1", "CMvZB2X2zq", "Ag9TzwrPCG", "rLLYC0K", "CMvJDxjZAxzL", "zgf0yvbHDgHhBg9IywW", "mJqZmJLeqLb0ruC", "uwfTDwy", "zw5NAw5L"];
  return Pi = function() {
    return e;
  }, Pi();
}
class Lc {
  constructor() {
    O(this, "engine");
    O(this, "util");
    const t = ZA;
    this[t(229)] = new CA.NodeIQQNTWrapperEngine(), this.util = new CA[t(231)]();
  }
  get [wt(237)]() {
    const t = wt, A = {};
    A.aIMVx = t(254), A[t(240)] = t(250);
    const i = A;
    let B = this[t(249)][t(239)]();
    if (!B)
      if (i[t(240)] !== i[t(240)]) {
        let g = this.util[t(239)]();
        if (!g) {
          g = _0x14740e[t(262)](_0x5d44de.homedir(), i[t(241)]);
          const n = {};
          n.recursive = !0, _0x2d3c33[t(251)](g, n);
        }
        return g;
      } else {
        B = rA.resolve(Pe[t(263)](), i[t(241)]);
        const g = {};
        g[t(265)] = !0, qe[t(251)](B, g);
      }
    return B;
  }
  get [wt(266)]() {
    const t = wt, A = {};
    A.PNxQH = t(236);
    const i = A;
    return rA[t(262)](this[t(237)], i[t(238)]);
  }
  init(t, A) {
    const i = wt;
    this.engine[i(243)](t, A);
  }
}
const RA = VA;
(function(e, t) {
  const A = VA, i = e();
  for (; ; )
    try {
      if (parseInt(A(399)) / 1 + parseInt(A(419)) / 2 * (parseInt(A(445)) / 3) + parseInt(A(406)) / 4 * (-parseInt(A(472)) / 5) + -parseInt(A(417)) / 6 + parseInt(A(463)) / 7 + parseInt(A(458)) / 8 + -parseInt(A(405)) / 9 * (parseInt(A(408)) / 10) === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(Xi, 229395);
const Mc = function() {
  const e = VA, t = {};
  t[e(407)] = function(B, g) {
    return B === g;
  }, t[e(457)] = "Uqmog", t[e(452)] = e(474);
  const A = t;
  let i = !0;
  return function(B, g) {
    const n = i ? function() {
      const I = VA;
      if (A[I(407)](A[I(457)], A.BfGrx))
        this.service[I(432)](_0x7c2787), this[I(477)](), this[I(403)][I(430)](new _0x58af1e[I(443)](this[I(421)]));
      else if (g) {
        const r = g[I(448)](B, arguments);
        return g = null, r;
      }
    } : function() {
    };
    return i = !1, n;
  };
}(), Hn = Mc(void 0, function() {
  const e = VA, t = {};
  t[e(464)] = "(((.+)+)+)+$";
  const A = t;
  return Hn[e(400)]()[e(461)](A[e(464)])[e(400)]()[e(444)](Hn).search(A[e(464)]);
});
Hn();
function VA(e, t) {
  const A = Xi();
  return VA = function(i, B) {
    i = i - 399;
    let g = A[i];
    if (VA.gnqUkt === void 0) {
      var n = function(Q) {
        const E = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
        let o = "", c = "", l = o + n;
        for (let u = 0, C, s, f = 0; s = Q.charAt(f++); ~s && (C = u % 4 ? C * 64 + s : s, u++ % 4) ? o += l.charCodeAt(f + 10) - 10 !== 0 ? String.fromCharCode(255 & C >> (-2 * u & 6)) : u : 0)
          s = E.indexOf(s);
        for (let u = 0, C = o.length; u < C; u++)
          c += "%" + ("00" + o.charCodeAt(u).toString(16)).slice(-2);
        return decodeURIComponent(c);
      };
      VA.EOTFSA = n, e = arguments, VA.gnqUkt = !0;
    }
    const I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      const Q = function(E) {
        this.dxHxWi = E, this.NZGXjG = [1, 0, 0], this.ljplnr = function() {
          return "newState";
        }, this.WYBGmY = "\\w+ *\\(\\) *{\\w+ *", this.zcyxPJ = `['|"].+['|"];? *}`;
      };
      Q.prototype.JOirUZ = function() {
        const E = new RegExp(this.WYBGmY + this.zcyxPJ), o = E.test(this.ljplnr.toString()) ? --this.NZGXjG[1] : --this.NZGXjG[0];
        return this.bxvxyh(o);
      }, Q.prototype.bxvxyh = function(E) {
        return ~E ? this.hRuqBa(this.dxHxWi) : E;
      }, Q.prototype.hRuqBa = function(E) {
        for (let o = 0, c = this.NZGXjG.length; o < c; o++)
          this.NZGXjG.push(Math.round(Math.random())), c = this.NZGXjG.length;
        return E(this.NZGXjG[0]);
      }, new Q(VA).JOirUZ(), g = VA.EOTFSA(g), e[r] = g;
    }
    return g;
  }, VA(e, t);
}
function Xi() {
  const e = ["uxvPy2SGBg9NAw4GzM9Yia", "CgfZC3DVCMrnzdu", "Bg9NAw5fCNjVCKLUzM8", "ALvTrge", "zxjYtxnN", "z2v0tg9NAw5mAxn0", "tM9KzuLlzxjUzwXmB2DPBKXPC3rLBMvY", "y29UC3rYDwn0B3i", "mta0mtbPvxjhC1i", "C3LZDgvTlMXVz2LUlNnSAwrLCG", "zxjYB3i", "yxbWBhK", "AgDzCfu", "tM8GCxvPy2SGBg9NAw4GywnJB3vUDhmGyxzHAwXHyMXL", "Aw5PDa", "qMzhCNG", "uuLovxa", "CMvZDwX0", "BwvZC2fNzq", "B25ruKnVzgvtzxnZAw9UrMfPBgvK", "B01nsMi", "mZa4odu0nenxBevAuq", "zw1PDa", "ChjVB2zxyxrLCLnPza", "C2vHCMnO", "zwrywhy", "mJe5otaYmMzezuXMDG", "u29vqMK", "Cg5NqMfZzty0uxjJB2rLrgf0yq", "y29Yzq", "BMv3rgv2AwnLtg9NAw5tAwC", "revktLy", "B25ruKnVzgvmB2DPBLn1y2nLzwq", "CxjJB2rLvxjS", "y29Kzq", "nwrezxbpuq", "vuPvEgW", "z2LuDwm", "CxjJB2rL", "y3vjthu", "Aw5PDeXPC3rLBMvY", "ChjVB2zxyxrLCLnPzW", "z2v0uvjdB2rLugLJDhvYzq", "tM9KzuLlzxjUzwXmB2DPBLnLCNzPy2u", "ugvAsKG", "EeLrzvi", "mtaXmJe0zhPYtxnP", "Dg9tDhjPBMC", "zxzRrxO", "igLZig5VDcbHDMfPBgfIBgu", "C2vYDMLJzq", "B25mB2DPBKzHAwXLza", "ntrZy1vYtvq", "nJmYnJuYuxv0yxnU", "EwvfAhC", "nty3nZqWtgn1qKns", "C3LZDgvTlMXVz2LUlMvYCM9Y", "A0Hrzw4", "ChjVB2zxyxrLCLjHBMq", "AxzSvu4", "zu1szLm", "DxjS", "Aw5PDfbVC3rmB2DPBG", "AxnrDwLJA0XVz2LU", "mtyWnti3nNP0uuvIyG", "ChjVB2zxyxrLCLvYBa", "mteYv0fsDuTx", "qvryAKq", "BgLZDgvUzxi", "yMfZzty0", "tg9JywXmB2DPBKLUzM9mAxn0", "v2fyqLm", "BeHfwue", "yKveq2S", "zgLNzxn0", "CxvPy2TmB2DPBLDPDgHvAw4", "DwLU", "ywrKs2vYBMvStg9NAw5mAxn0zw5LCG", "wfjgzwy", "Aw5PDenVBMzPzW", "B25ruKnVzgvhzxrqAwn0DxjL", "y0rxzKK", "C3LZDgvTlMXVz2LUlNfYy29Kzq", "CgfZC3DVCMq"];
  return Xi = function() {
    return e;
  }, Xi();
}
var Ff;
class kc {
  constructor(t) {
    O(this, "core");
    O(this, Ff);
    O(this, "listener");
    const A = RA, i = {};
    i.jUmDa = A(456), i[A(468)] = A(404);
    const B = i;
    this[A(466)] = t, this[A(403)] = new CA[A(480)](), this[A(421)] = new fo(), this[A(421)][A(456)] = (g) => {
      console.error(B[A(440)], g);
    }, this.listener[A(404)] = (g) => {
      console.error(B.DEJNV, g);
    };
  }
  [(Ff = RA(403), RA(451))](t) {
    const A = RA;
    this.service[A(432)](t), this.initListener(), this[A(403)][A(430)](new CA[A(443)](this[A(421)]));
  }
  [RA(477)]() {
    const t = RA, A = {};
    A.evkEz = t(435), A[t(425)] = "onQRCodeSessionFailed", A[t(481)] = t(404), A[t(449)] = function(B, g) {
      return B !== g;
    }, A[t(476)] = t(410), A[t(413)] = t(482);
    const i = A;
    this[t(421)][t(433)] = (B) => {
      const g = t, n = {};
      n[g(414)] = B[g(470)], n[g(422)] = B[g(465)], this.core[g(459)](i[g(401)], n);
    }, this.listener[t(469)] = (B) => {
      const g = t, n = {};
      n.ATXjD = i.PeZJH;
      const I = n;
      if (i[g(449)](i.cuILu, i[g(413)]))
        this[g(466)].initPostLogin(B);
      else {
        const r = {};
        r[g(424)] = i.lHEYA;
        const a = r;
        this.core = _0x2df64a, this[g(403)] = new _0x1e890e[g(480)](), this[g(421)] = new _0x253b6d(), this[g(421)][g(456)] = (Q) => {
          const E = g;
          _0x4b9e58[E(447)](a[E(424)], Q);
        }, this[g(421)][g(404)] = (Q) => {
          const E = g;
          _0x526b49[E(447)](I[E(420)], Q);
        };
      }
    };
  }
  [RA(442)]() {
    return this[RA(403)].getLoginList();
  }
  async [RA(475)]() {
    const t = RA;
    this[t(403)][t(479)]();
  }
  async quick(t) {
    const A = RA, i = {};
    i.cDWfI = function(r, a) {
      return r !== a;
    }, i.xkhNR = A(450);
    const B = i, g = await this[A(442)]();
    if (B[A(434)](g[A(454)], 0))
      throw new Error(B.xkhNR);
    const n = g[A(423)].find((r) => r[A(429)] === t);
    if (!n || !(n != null && n[A(416)]))
      throw new Error(A(437) + t + A(402));
    await wn(1e3);
    const I = await this[A(403)][A(428)](t);
    I[A(454)] || this.core[A(459)](A(409), { code: I.result, message: I[A(439)][A(441)] });
  }
  async [RA(436)](t, A, i, B, g) {
    const n = RA, I = { edXXv: "hex", bEDCk: function(o, c) {
      return o(c);
    }, XRFef: "140022008", QINUp: function(o, c) {
      return o === c;
    }, HffNg: n(473), ivlUN: n(409) }, r = co.createHash("md5").update(A)[n(427)](I[n(462)]), a = {};
    a[n(429)] = t, a[n(438)] = r, a.step = i && B && g ? 1 : 0, a[n(467)] = "", a[n(478)] = i || "", a[n(411)] = B || "", a[n(460)] = g || "";
    const Q = a;
    await this[n(442)](), await I[n(426)](wn, 1e3);
    const E = await this[n(403)].passwordLogin(Q);
    switch (E.result) {
      case "0":
        break;
      case I[n(431)]: {
        const o = {};
        o[n(414)] = E[n(439)][n(418)], this[n(466)][n(459)](n(446), o);
        break;
      }
      case "4":
      case "140022013":
      default:
        if (I[n(453)]("UJUxl", I.HffNg)) {
          const o = {};
          o[n(471)] = E.result, o[n(455)] = E[n(439)][n(441)], this[n(466)][n(459)](I[n(412)], o);
        } else
          this[n(466)][n(415)](_0x458eec);
    }
  }
}
const yt = re;
(function(e, t) {
  const A = re, i = e();
  for (; ; )
    try {
      if (-parseInt(A(135)) / 1 * (-parseInt(A(136)) / 2) + -parseInt(A(145)) / 3 + -parseInt(A(128)) / 4 * (-parseInt(A(125)) / 5) + parseInt(A(119)) / 6 * (parseInt(A(115)) / 7) + -parseInt(A(143)) / 8 * (-parseInt(A(121)) / 9) + parseInt(A(120)) / 10 * (-parseInt(A(129)) / 11) + -parseInt(A(130)) / 12 === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(zi, 141894);
const Kc = function() {
  const e = re, t = {};
  t.idYZx = function(B, g) {
    return B !== g;
  }, t[e(139)] = e(104), t[e(146)] = "init failed", t[e(141)] = e(118);
  const A = t;
  let i = !0;
  return function(B, g) {
    const n = e, I = {};
    I[n(107)] = A[n(139)], I[n(123)] = A[n(146)];
    const r = I;
    if (n(118) !== A[n(141)])
      return _0x32a389[n(147)]()[n(133)](r.CFRit)[n(147)]()[n(134)](_0x396786)[n(133)]("(((.+)+)+)+$");
    {
      const a = i ? function() {
        const Q = n;
        if (A[Q(142)](Q(132), "zVrCb"))
          try {
            this[Q(124)][Q(106)]();
          } catch (E) {
            _0x2a5977[Q(103)](r[Q(123)], E);
          }
        else if (g) {
          const E = g[Q(105)](B, arguments);
          return g = null, E;
        }
      } : function() {
      };
      return i = !1, a;
    }
  };
}(), Yn = Kc(void 0, function() {
  const e = re, t = {};
  t[e(144)] = e(104);
  const A = t;
  return Yn[e(147)]()[e(133)](A[e(144)])[e(147)]().constructor(Yn)[e(133)](e(104));
});
Yn();
function re(e, t) {
  const A = zi();
  return re = function(i, B) {
    i = i - 102;
    let g = A[i];
    if (re.ueczxP === void 0) {
      var n = function(Q) {
        const E = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
        let o = "", c = "", l = o + n;
        for (let u = 0, C, s, f = 0; s = Q.charAt(f++); ~s && (C = u % 4 ? C * 64 + s : s, u++ % 4) ? o += l.charCodeAt(f + 10) - 10 !== 0 ? String.fromCharCode(255 & C >> (-2 * u & 6)) : u : 0)
          s = E.indexOf(s);
        for (let u = 0, C = o.length; u < C; u++)
          c += "%" + ("00" + o.charCodeAt(u).toString(16)).slice(-2);
        return decodeURIComponent(c);
      };
      re.drUBXD = n, e = arguments, re.ueczxP = !0;
    }
    const I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      const Q = function(E) {
        this.UEWRnK = E, this.AkWlje = [1, 0, 0], this.yBaPzJ = function() {
          return "newState";
        }, this.OMGgZm = "\\w+ *\\(\\) *{\\w+ *", this.kwWxXh = `['|"].+['|"];? *}`;
      };
      Q.prototype.perADb = function() {
        const E = new RegExp(this.OMGgZm + this.kwWxXh), o = E.test(this.yBaPzJ.toString()) ? --this.AkWlje[1] : --this.AkWlje[0];
        return this.AbpAab(o);
      }, Q.prototype.AbpAab = function(E) {
        return ~E ? this.MazcIa(this.UEWRnK) : E;
      }, Q.prototype.MazcIa = function(E) {
        for (let o = 0, c = this.AkWlje.length; o < c; o++)
          this.AkWlje.push(Math.round(Math.random())), c = this.AkWlje.length;
        return E(this.AkWlje[0]);
      }, new Q(re).perADb(), g = re.drUBXD(g), e[r] = g;
    }
    return g;
  }, re(e, t);
}
function zi() {
  const e = ["ELzYq2i", "C2vHCMnO", "y29UC3rYDwn0B3i", "ndeYmKzgwM9dta", "mti4rgrcvMTc", "BgLZDgvUzxi", "wLPotfi", "BuHAzeu", "y1vrDKS", "qufmrKG", "AwrzwNG", "ndK3nMDYwfvLtW", "y2vKEfG", "mJeYmdm3B1vtueTr", "ueLuA1m", "Dg9tDhjPBMC", "qxHyuuW", "zxjYB3i", "kcGOlISPkYKRksSK", "yxbWBhK", "C3rHCNrova", "q0zsAxq", "uvDJu00", "tM9KzuLezxbLBMrZqwrHChrLCG", "Aw5PDcbMywLSzwq", "ufDnBfq", "Aurpvxy", "zuPlD00", "tM9KzuLruu5uv3jHChbLCLnLC3nPB24", "n1vNrNvcuW", "rLfJuwe", "uKH4yxu", "teH3rwK", "mty1mte3mhj0AKPXDa", "mtb6wMHIv0G", "mti5nLHUvgLXqq", "v0rWEfK", "D0n1tuC", "D3jHChbLCG", "mZeWt0nVAfHZ", "B25tzxnZAw9Usw5PDenVBxbSzxrL", "tM9KzuLeAxnWyxrJAgvYqwrHChrLCG", "mta4ndbHrfvkwNK", "nZKYndCZtKjcDfrL", "nJe0mZCWmefHDLvwBW", "Aw5PDa"];
  return zi = function() {
    return e;
  }, zi();
}
var Rf, Sf;
class Jc {
  constructor() {
    O(this, Rf);
    O(this, Sf);
    const t = yt;
    this[t(124)] = new CA[t(114)](), this.listener = new uo();
  }
  [(Rf = yt(124), Sf = yt(137), yt(131))](t, A, i) {
    const B = yt, g = { eJKwM: function(n, I) {
      return n === I;
    }, ynLBn: function(n, I) {
      return n(I);
    }, cUQvK: function(n, I, r, a) {
      return n(I, r, a);
    }, RHxau: function(n, I) {
      return n === I;
    }, PWMlT: B(122), iDOUv: function(n, I) {
      return n !== I;
    }, AxXQL: B(138) };
    return new Promise((n, I) => {
      const r = B, a = {};
      a[r(108)] = r(110);
      const Q = a, E = g[r(140)](NQ, t, A, i);
      this[r(137)][r(126)] = (o) => {
        if (g[r(113)](o, 0))
          return g.ynLBn(n, 0);
        g.ynLBn(I, o);
      }, this[r(124)][r(131)](E, new CA[r(109)](new Eo()), new CA[r(127)](new Qo()), new CA.NodeIKernelSessionListener(this[r(137)]));
      try {
        g[r(117)](r(116), g[r(111)]) ? _0x20c155[r(103)](Q[r(108)], _0x274d2f) : this[r(124)].startNT(0);
      } catch {
        if (g[r(112)](g[r(102)], g[r(102)]))
          this[r(124)][r(106)]();
        else
          try {
            this[r(124)].startNT();
          } catch (c) {
            console[r(103)](r(110), c);
          }
      }
    });
  }
}
var At = Ee;
(function(e, t) {
  for (var A = Ee, i = e(); ; )
    try {
      var B = -parseInt(A(519)) / 1 * (parseInt(A(505)) / 2) + -parseInt(A(503)) / 3 + parseInt(A(507)) / 4 * (-parseInt(A(520)) / 5) + -parseInt(A(511)) / 6 * (parseInt(A(521)) / 7) + -parseInt(A(500)) / 8 * (-parseInt(A(524)) / 9) + -parseInt(A(493)) / 10 + parseInt(A(518)) / 11 * (parseInt(A(529)) / 12);
      if (B === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(Oi, 907984);
var Wc = function() {
  var e = {};
  e.JUrYE = "ZYIVH";
  var t = e, A = !0;
  return function(i, B) {
    var g = Ee, n = {};
    n[g(525)] = function(a, Q) {
      return a === Q;
    }, n[g(528)] = t[g(498)];
    var I = n, r = A ? function() {
      var a = g;
      if (B)
        if (I.YakRJ(a(530), I[a(528)]))
          _0x2516e9[a(516)] = _0x31922a[a(516)], _0x398ac3[a(512)](_0x105e72)[a(513)]();
        else {
          var Q = B[a(537)](i, arguments);
          return B = null, Q;
        }
    } : function() {
    };
    return A = !1, r;
  };
}(), Ln = Wc(void 0, function() {
  var e = Ee, t = {};
  t[e(522)] = e(497);
  var A = t;
  return Ln[e(526)]()[e(492)](e(497)).toString()[e(499)](Ln)[e(492)](A[e(522)]);
});
Ln();
function Ee(e, t) {
  var A = Oi();
  return Ee = function(i, B) {
    i = i - 492;
    var g = A[i];
    if (Ee.RRBrmf === void 0) {
      var n = function(E) {
        for (var o = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=", c = "", l = "", u = c + n, C = 0, s, f, h = 0; f = E.charAt(h++); ~f && (s = C % 4 ? s * 64 + f : f, C++ % 4) ? c += u.charCodeAt(h + 10) - 10 !== 0 ? String.fromCharCode(255 & s >> (-2 * C & 6)) : C : 0)
          f = o.indexOf(f);
        for (var x = 0, d = c.length; x < d; x++)
          l += "%" + ("00" + c.charCodeAt(x).toString(16)).slice(-2);
        return decodeURIComponent(l);
      };
      Ee.nwJvKc = n, e = arguments, Ee.RRBrmf = !0;
    }
    var I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      var Q = function(E) {
        this.YyLtnb = E, this.pmqsoi = [1, 0, 0], this.GobcYR = function() {
          return "newState";
        }, this.afoYPP = "\\w+ *\\(\\) *{\\w+ *", this.xSKRpu = `['|"].+['|"];? *}`;
      };
      Q.prototype.ZmkVpI = function() {
        var E = new RegExp(this.afoYPP + this.xSKRpu), o = E.test(this.GobcYR.toString()) ? --this.pmqsoi[1] : --this.pmqsoi[0];
        return this.jEWmab(o);
      }, Q.prototype.jEWmab = function(E) {
        return ~E ? this.hwZERy(this.YyLtnb) : E;
      }, Q.prototype.hwZERy = function(E) {
        for (var o = 0, c = this.pmqsoi.length; o < c; o++)
          this.pmqsoi.push(Math.round(Math.random())), c = this.pmqsoi.length;
        return E(this.pmqsoi[0]);
      }, new Q(Ee).ZmkVpI(), g = Ee.nwJvKc(g), e[r] = g;
    }
    return g;
  }, Ee(e, t);
}
function Oi() {
  var e = ["zhfIu1u", "mJyZodu4ntjVzLPWEwK", "Bwrnwem", "u3DSvM0", "C3vzAKu", "s1vnDK8", "BxnNswq", "y2f0y2G", "Aw5PDa", "yxbWBhK", "C2vHCMnO", "otG5mJa2mhntqxLQuG", "t2HgtwG", "A2vYBMvSu2vYDMLJzq", "tM9KzuLlzxjUzwXnC2DmAxn0zw5LCG", "kcGOlISPkYKRksSK", "sLvYwuu", "y29UC3rYDwn0B3i", "ndm2nte2mgfAEw11ua", "q1LXrKy", "wwzsvgO", "mtiYodmWmLj3Ber6Aa", "BNrgtMC", "mtrmv1bbvg0", "ywrKtxnNtgLZDgvUzxi", "mJy4vvzgvu5j", "BgLZDgvUzxi", "wvbSAKK", "twvZC2fNzvnLCNzPy2uGywXYzwfKEsbPBML0AwfSAxPLzce", "ndi2sKHlEwDk", "DxbKyxrLtxnN", "DgHLBG", "BhLvAKq", "z2v0txnNqNLmB25Nswq", "CMvJywXSvgLTzq", "ywrKtxnN", "mJjiz3HMuKO", "mte2odmZt1H2uenQ", "nJm0mJv5s1Ddzw4", "otu1mJLjwfPnB1a", "teDIBK4", "ywrKs2vYBMvStxnNtgLZDgvUzxi", "oxvrB21IvW", "wwfRuKO", "Dg9tDhjPBMC", "BwfW"];
  return Oi = function() {
    return e;
  }, Oi();
}
var bf, Nf;
class qc {
  constructor() {
    O(this, bf, null);
    O(this, Nf);
    var t = At, A = {};
    A[t(532)] = function(B, g) {
      return B === g;
    }, A.lyUjD = "QldLV", A[t(531)] = function(B, g) {
      return B !== g;
    }, A[t(504)] = t(502);
    var i = A;
    this.listener = new iB(), this[t(508)].onMsgInfoListUpdate = (B) => {
      var g = t, n = { bFkaD: function(r, a) {
        return i.suYjE(r, a);
      }, OhFMh: i[g(514)], CYqFF: g(533) };
      if (i[g(531)](i[g(504)], g(502))) {
        var I = _0x1089f9.apply(_0x2c2aa5, arguments);
        return _0x1daec6 = null, I;
      } else
        B[g(527)]((r) => {
          var a = g;
          if (r[a(516)] === "0")
            ii[a(517)](r)[a(513)]()[a(535)]();
          else if (n.bFkaD(n[a(494)], n[a(501)])) {
            var Q = _0x4fb9b4 ? function() {
              var E = a;
              if (_0x5119e6) {
                var o = _0x570cb2[E(537)](_0xf5fa84, arguments);
                return _0x31264c = null, o;
              }
            } : function() {
            };
            return _0x49b92a = !1, Q;
          } else
            ii[a(515)](r[a(534)])[a(513)]((E) => {
              var o = a;
              E && (E[o(516)] = r.recallTime, ii[o(512)](E)[o(513)]());
            });
        });
    };
  }
  [(bf = At(495), Nf = At(508), At(536))](t) {
    var A = At, i = {};
    i[A(509)] = A(510);
    var B = i;
    if (this[A(495)] !== null)
      throw new Error(B.YPljI);
    this[A(495)] = t, this.kernelService[A(523)](new CA[A(496)](this[A(508)]));
  }
  [At(506)](t) {
    var i;
    var A = At;
    return (i = this[A(495)]) == null ? void 0 : i[A(523)](new CA[A(496)](t));
  }
}
const Et = Qe;
function Qe(e, t) {
  const A = _i();
  return Qe = function(i, B) {
    i = i - 338;
    let g = A[i];
    if (Qe.BmQFfh === void 0) {
      var n = function(Q) {
        const E = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
        let o = "", c = "", l = o + n;
        for (let u = 0, C, s, f = 0; s = Q.charAt(f++); ~s && (C = u % 4 ? C * 64 + s : s, u++ % 4) ? o += l.charCodeAt(f + 10) - 10 !== 0 ? String.fromCharCode(255 & C >> (-2 * u & 6)) : u : 0)
          s = E.indexOf(s);
        for (let u = 0, C = o.length; u < C; u++)
          c += "%" + ("00" + o.charCodeAt(u).toString(16)).slice(-2);
        return decodeURIComponent(c);
      };
      Qe.eknUCj = n, e = arguments, Qe.BmQFfh = !0;
    }
    const I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      const Q = function(E) {
        this.dWsoMP = E, this.uwJunb = [1, 0, 0], this.JpkFak = function() {
          return "newState";
        }, this.DJQQWa = "\\w+ *\\(\\) *{\\w+ *", this.iLpBuZ = `['|"].+['|"];? *}`;
      };
      Q.prototype.HZRUfa = function() {
        const E = new RegExp(this.DJQQWa + this.iLpBuZ), o = E.test(this.JpkFak.toString()) ? --this.uwJunb[1] : --this.uwJunb[0];
        return this.edZsHP(o);
      }, Q.prototype.edZsHP = function(E) {
        return ~E ? this.obXpAG(this.dWsoMP) : E;
      }, Q.prototype.obXpAG = function(E) {
        for (let o = 0, c = this.uwJunb.length; o < c; o++)
          this.uwJunb.push(Math.round(Math.random())), c = this.uwJunb.length;
        return E(this.uwJunb[0]);
      }, new Q(Qe).HZRUfa(), g = Qe.eknUCj(g), e[r] = g;
    }
    return g;
  }, Qe(e, t);
}
(function(e, t) {
  const A = Qe, i = e();
  for (; ; )
    try {
      if (parseInt(A(373)) / 1 + parseInt(A(359)) / 2 * (-parseInt(A(385)) / 3) + parseInt(A(382)) / 4 * (parseInt(A(396)) / 5) + -parseInt(A(341)) / 6 * (-parseInt(A(347)) / 7) + parseInt(A(372)) / 8 + -parseInt(A(345)) / 9 * (parseInt(A(371)) / 10) + parseInt(A(391)) / 11 * (-parseInt(A(339)) / 12) === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(_i, 978960);
const Zc = /* @__PURE__ */ function() {
  let e = !0;
  return function(t, A) {
    const i = e ? function() {
      const B = Qe;
      if (A) {
        const g = A[B(374)](t, arguments);
        return A = null, g;
      }
    } : function() {
    };
    return e = !1, i;
  };
}(), Mn = Zc(void 0, function() {
  const e = Qe, t = {};
  t[e(342)] = "(((.+)+)+)+$";
  const A = t;
  return Mn.toString().search(A[e(342)]).toString()[e(354)](Mn)[e(358)](A[e(342)]);
});
Mn();
function _i() {
  const e = ["C2nLBMvjza", "B0TUsNe", "mta1nJG2mZbcrw1LvwS", "mti4mde5mKL3y3PwqW", "odu0mdKYzLnowfjj", "yxbWBhK", "BgLZDgvUzxi", "yxnZAwDU", "zM9YrwfJAa", "ywrKs2vYBMvSr3jVDxbmAxn0zw5LCG", "Aw5PDa", "DwLU", "vMroqMK", "nJCYnZi2ofHIyurdBG", "wePbDvO", "wNzwDvu", "mtjPz2n2Cum", "AgfZ", "uurJDwG", "B25nzw1IzxjjBMzVq2HHBMDL", "Buftrvq", "B25nzw1IzxjmAxn0q2HHBMDL", "mJa5zKzNBfzL", "A2vYBMvSu2vYDMLJzq", "sxf0Bw0", "zwLZDxe", "vfPvwhe", "nuLXvfnvDG", "sNboDhG", "mteZotKXnMflEw1HDa", "BwfW", "mtqZndG3mgz2tMrZzq", "uwrRr2u", "Cw5vD0i", "z3jVDxbdB2rL", "ouHrCxnAzG", "se9zCeC", "mZvPz1Hfvhu", "s0HhAva", "tM9KzuLlzxjUzwXhCM91CeXPC3rLBMvY", "Aw5MB3m", "z3jVDxbnzw1IzxjmAxn0x01HAw5xAw5KB3C", "DvDnsNC", "ANbotMK", "y29UC3rYDwn0B3i", "sMH2Dfy", "v1btsLG", "yMrXvuG", "C2vHCMnO", "mJu0odrsDMfTCwy", "r3jVDxbtzxj2AwnLigfSCMvHzhKGAw5PDgLHBgL6zwqH", "z2v0tMv4De1LBwjLCKXPC3q", "D2jjCKe", "uejOsgO", "C2v0", "q1nuChe", "zuzKALu", "DgHLBG", "z2v0"];
  return _i = function() {
    return e;
  }, _i();
}
var Uf, vf;
class Vc {
  constructor() {
    O(this, Uf, null);
    O(this, vf);
    const t = Et;
    this[t(375)] = new iE();
  }
  [(Uf = Et(392), vf = Et(375), Et(379))](t) {
    const A = Et, i = {};
    i[A(387)] = A(351), i.TZUXq = A(356), i.aOgTS = A(393), i.JpNtx = A(370), i[A(363)] = function(g, n) {
      return g === n;
    }, i[A(365)] = A(381), i.HOYpG = function(g, n) {
      return g !== n;
    }, i[A(394)] = A(362), i[A(352)] = function(g, n) {
      return g !== n;
    };
    const B = i;
    if (B[A(352)](this.kernelService, null))
      throw new Error(A(360));
    this[A(392)] = t, this[A(375)].onGroupListUpdate = (g, n) => {
      const I = A, r = {};
      r[I(353)] = B.QDcuh;
      const a = r;
      n[I(340)]((Q) => {
        var c, l;
        const E = I, o = Dr[E(368)](Q.groupCode);
        if (o)
          Object[E(376)](o, Q);
        else {
          Dr.set(Q[E(344)], Q);
          const u = (c = this.kernelService) == null ? void 0 : c.createMemberListScene(Q[E(344)], a[E(353)]);
          (l = this[E(392)]) == null || l[E(361)](u, void 0, 3e3)[E(367)]((C) => {
          });
        }
      });
    }, this[A(375)][A(390)] = (g) => {
      const n = A, I = {};
      I[n(357)] = function(a, Q) {
        return a === Q;
      }, I[n(343)] = B[n(395)], I[n(355)] = function(a, Q) {
        return a !== Q;
      }, I.ZvVuU = B.aOgTS;
      const r = I;
      if (B[n(338)] === B[n(338)]) {
        const a = g[n(369)].split("_")[0];
        if (lt[n(386)](a)) {
          if (B[n(363)](n(389), n(389))) {
            const Q = lt[n(368)](a);
            g[n(350)][n(377)]((E, o) => {
              var C, s;
              const c = n, l = {};
              l[c(366)] = c(351);
              const u = l;
              if (r[c(357)](r[c(343)], r[c(343)])) {
                const f = Q[c(368)](o);
                if (f)
                  Object.assign(f, E);
                else if (r[c(355)](r[c(384)], r[c(384)])) {
                  _0xca2319[c(364)](_0x5729df.groupCode, _0x5f5483);
                  const h = (C = this.kernelService) == null ? void 0 : C.createMemberListScene(_0x297a43[c(344)], u.eFdjU);
                  (s = this[c(392)]) == null || s[c(361)](h, void 0, 3e3)[c(367)]((x) => {
                  });
                } else
                  Q[c(364)](o, E);
              } else
                _0x639630[c(364)](_0x194aff, _0x1c9489[c(350)]);
            });
          } else if (_0x1e3a10) {
            const Q = _0x172cdb[n(374)](_0x573978, arguments);
            return _0x26ed81 = null, Q;
          }
        } else
          lt[n(364)](a, g[n(350)]);
      } else
        _0x455bc6[n(364)](_0x7cd140, _0x32c7be);
    }, this[A(375)][A(388)] = (g, n, I) => {
      const r = A, a = {};
      a.KHGiP = B[r(365)];
      const Q = a;
      I[r(377)]((o, c) => {
        const l = r;
        UQ[c] = o[l(380)];
      });
      const E = lt.get(g);
      if (E)
        if (B[r(346)](r(362), B[r(394)])) {
          const o = _0x14ea01.get(_0x4a44a9);
          o ? _0x1963e8[r(376)](o, _0x26fd72) : _0x55324c[r(364)](_0x3805d6, _0x3ee580);
        } else
          I[r(377)]((o, c) => {
            const l = r, u = E.get(c);
            if (u)
              Object[l(376)](u, o);
            else if (Q[l(348)] === l(383)) {
              const C = _0x3d5c20[l(374)](_0x342519, arguments);
              return _0x32aa64 = null, C;
            } else
              E[l(364)](c, o);
          });
      else
        lt[r(364)](g, I);
    }, this.kernelService[A(378)](new CA[A(349)](this[A(375)]));
  }
  addGroupListener(t) {
    var i;
    const A = Et;
    return (i = this[A(392)]) == null ? void 0 : i[A(378)](new CA.NodeIKernelGroupListener(t));
  }
}
function TA(e, t) {
  const A = ji();
  return TA = function(i, B) {
    i = i - 350;
    let g = A[i];
    if (TA.quNBHF === void 0) {
      var n = function(Q) {
        const E = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
        let o = "", c = "", l = o + n;
        for (let u = 0, C, s, f = 0; s = Q.charAt(f++); ~s && (C = u % 4 ? C * 64 + s : s, u++ % 4) ? o += l.charCodeAt(f + 10) - 10 !== 0 ? String.fromCharCode(255 & C >> (-2 * u & 6)) : u : 0)
          s = E.indexOf(s);
        for (let u = 0, C = o.length; u < C; u++)
          c += "%" + ("00" + o.charCodeAt(u).toString(16)).slice(-2);
        return decodeURIComponent(c);
      };
      TA.AgKQLA = n, e = arguments, TA.quNBHF = !0;
    }
    const I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      const Q = function(E) {
        this.biCraF = E, this.owAzcs = [1, 0, 0], this.BvTksq = function() {
          return "newState";
        }, this.JWEIQN = "\\w+ *\\(\\) *{\\w+ *", this.SocHys = `['|"].+['|"];? *}`;
      };
      Q.prototype.SoLBsf = function() {
        const E = new RegExp(this.JWEIQN + this.SocHys), o = E.test(this.BvTksq.toString()) ? --this.owAzcs[1] : --this.owAzcs[0];
        return this.QuLNay(o);
      }, Q.prototype.QuLNay = function(E) {
        return ~E ? this.xRQghf(this.biCraF) : E;
      }, Q.prototype.xRQghf = function(E) {
        for (let o = 0, c = this.owAzcs.length; o < c; o++)
          this.owAzcs.push(Math.round(Math.random())), c = this.owAzcs.length;
        return E(this.owAzcs[0]);
      }, new Q(TA).SoLBsf(), g = TA.AgKQLA(g), e[r] = g;
    }
    return g;
  }, TA(e, t);
}
const jt = TA;
(function(e, t) {
  const A = TA, i = e();
  for (; ; )
    try {
      if (-parseInt(A(384)) / 1 + parseInt(A(380)) / 2 * (parseInt(A(353)) / 3) + -parseInt(A(363)) / 4 * (-parseInt(A(352)) / 5) + parseInt(A(371)) / 6 * (parseInt(A(359)) / 7) + parseInt(A(366)) / 8 + parseInt(A(385)) / 9 * (parseInt(A(361)) / 10) + -parseInt(A(354)) / 11 === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(ji, 796732);
const Tc = function() {
  const e = TA, t = {};
  t[e(350)] = function(B, g) {
    return B !== g;
  }, t[e(377)] = e(370), t[e(360)] = function(B, g) {
    return B !== g;
  }, t[e(369)] = "lFHNI";
  const A = t;
  let i = !0;
  return function(B, g) {
    const n = i ? function() {
      const I = TA;
      if (A[I(350)](A[I(377)], I(370))) {
        const r = _0x471e8b[I(357)](_0x24abcd.uid);
        _0x2cbae0[_0x547b9a[I(383)]] = _0x397acd[I(379)], r ? _0x249c16[I(372)](r, _0x352bdc) : _0x4c4eb6.set(_0xbf025e.uid, _0x57b4c5);
      } else if (g)
        if (A[I(360)](A.ctwrg, A[I(369)])) {
          if (_0x310064) {
            const r = _0x33a746[I(355)](_0x2b579f, arguments);
            return _0x8f4467 = null, r;
          }
        } else {
          const r = g.apply(B, arguments);
          return g = null, r;
        }
    } : function() {
    };
    return i = !1, n;
  };
}(), kn = Tc(void 0, function() {
  const e = TA, t = {};
  t[e(356)] = e(386);
  const A = t;
  return kn[e(364)]()[e(367)](e(386))[e(364)]()[e(362)](kn)[e(367)](A.gSxHl);
});
kn();
function ji() {
  const e = ["B25cDwrKEuXPC3rdAgfUz2u", "ndqZmJm1mMrKuMT1Cq", "C2vHCMnO", "tM9KzuLlzxjUzwXcDwrKEuXPC3rLBMvY", "y3r3CMC", "uM5dz0u", "mtjnBevKy2i", "yxnZAwDU", "A2vYBMvSu2vYDMLJzq", "C2v0", "sfHtyuu", "BgLZDgvUzxi", "tLvzzxO", "DgHLBG", "DwLU", "mtbWDu93tfm", "twvZC2fNzvnLCNzPy2uGywXYzwfKEsbPBML0AwfSAxPLzce", "yNvKzhLmAxn0", "DwLK", "nteYmdnTtu5iD2K", "nJG0DwjdrxLs", "kcGOlISPkYKRksSK", "z25hru8", "zMHND0G", "ywrKs2vYBMvSqNvKzhLmAxn0zw5LCG", "mZa1mhPNzfbttq", "odCZnZC3r2zly1Hp", "mJqWnJaXnJH3zxzky2m", "yxbWBhK", "z1n4sgW", "z2v0", "z2v0qNvKzhLmAxn0", "mte0nJGZmuvNqLDwtq", "q3POs1G", "ntiZmZbnzgjOAvm", "y29UC3rYDwn0B3i", "mtK2nfjJEK5bzq", "Dg9tDhjPBMC"];
  return ji = function() {
    return e;
  }, ji();
}
var Hf, Yf;
class Pc {
  constructor() {
    O(this, Hf, null);
    O(this, Yf);
    this.listener = new xo();
  }
  init(t) {
    const A = jt, i = {};
    i[A(387)] = function(g, n) {
      return g !== n;
    };
    const B = i;
    if (this[A(373)] !== null)
      throw new Error(A(381));
    this[A(373)] = t, this[A(376)][A(365)] = (g) => {
      const n = A;
      if (B[n(387)](n(375), "HXSaE"))
        for (const I of _0x3f4171[n(382)]) {
          const r = _0x5a06f8[n(357)](I[n(383)]);
          _0x5c1303[I[n(383)]] = I[n(379)], r ? _0x8006bd[n(372)](r, I) : _0x92705f[n(374)](I[n(383)], I);
        }
      else
        for (const I of g)
          for (const r of I[n(382)]) {
            const a = pr.get(r[n(383)]);
            UQ[r[n(383)]] = r[n(379)], a ? Object[n(372)](a, r) : pr[n(374)](r[n(383)], r);
          }
    }, this[A(373)][A(351)](new CA[A(368)](this.listener)), this[A(373)][A(358)](!0)[A(378)]((g) => {
    });
  }
  addBuddyListener(t) {
    var i;
    const A = jt;
    (i = this.kernelService) == null || i[A(351)](new CA[A(368)](t));
  }
}
Hf = jt(373), Yf = jt(376);
var $t = PA;
(function(e, t) {
  for (var A = PA, i = e(); ; )
    try {
      var B = parseInt(A(288)) / 1 + -parseInt(A(280)) / 2 * (parseInt(A(273)) / 3) + -parseInt(A(274)) / 4 * (-parseInt(A(287)) / 5) + parseInt(A(268)) / 6 * (-parseInt(A(275)) / 7) + -parseInt(A(284)) / 8 * (-parseInt(A(278)) / 9) + -parseInt(A(276)) / 10 + parseInt(A(264)) / 11;
      if (B === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})($i, 173115);
var Xc = function() {
  var e = PA, t = {};
  t.jIYnT = function(B, g) {
    return B === g;
  }, t[e(283)] = e(260);
  var A = t, i = !0;
  return function(B, g) {
    var r;
    var n = e;
    if (A.jIYnT(n(260), A.Dxckh)) {
      var I = i ? function() {
        if (g) {
          var a = g.apply(B, arguments);
          return g = null, a;
        }
      } : function() {
      };
      return i = !1, I;
    } else
      return (r = this[n(270)]) == null ? void 0 : r[n(286)](new _0x5469ca[n(281)](_0x1e22b8));
  };
}(), Kn = Xc(void 0, function() {
  var e = PA, t = {};
  t[e(259)] = "(((.+)+)+)+$";
  var A = t;
  return Kn.toString()[e(267)](A[e(259)])[e(269)]()[e(282)](Kn)[e(267)](A[e(259)]);
});
function $i() {
  var e = ["Aw5PDa", "z0LgthO", "sgD5AKS", "z2v0vxnLCKrLDgfPBeLUzM9xAxrOqML6sw5MBW", "u0XKDLG", "q0HID3i", "mJG5nZC0muL2DgDJAG", "yxnZAwDU", "uhjVzMLSzvnLCNzPy2uGywXYzwfKEsbPBML0AwfSAxPLzce", "C2vHCMnO", "ndyWmLH6yK9nvW", "Dg9tDhjPBMC", "A2vYBMvSu2vYDMLJzq", "ywrKuhjVzMLSzuXPC3rLBMvY", "uMrXzvm", "nZC0m05lweP6Dq", "ndC2r0PxwKrA", "mJe2m0zbuuTnrW", "mtCZnZqWtNnOru5v", "BgLZDgvUzxi", "mtHxDezqDvy", "Avrny2e", "mtm4CunJAuHX", "tM9KzuLlzxjUzwXqCM9MAwXLtgLZDgvUzxi", "y29UC3rYDwn0B3i", "rhHJA2G", "ntKYnty4Aw5gyLre", "DwLK", "ywrKs2vYBMvSuhjVzMLSzuXPC3rLBMvY", "nty4nuHJr0T0CG", "ntG3mdvrv2TXD1K"];
  return $i = function() {
    return e;
  }, $i();
}
function PA(e, t) {
  var A = $i();
  return PA = function(i, B) {
    i = i - 258;
    var g = A[i];
    if (PA.SqmyYI === void 0) {
      var n = function(E) {
        for (var o = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=", c = "", l = "", u = c + n, C = 0, s, f, h = 0; f = E.charAt(h++); ~f && (s = C % 4 ? s * 64 + f : f, C++ % 4) ? c += u.charCodeAt(h + 10) - 10 !== 0 ? String.fromCharCode(255 & s >> (-2 * C & 6)) : C : 0)
          f = o.indexOf(f);
        for (var x = 0, d = c.length; x < d; x++)
          l += "%" + ("00" + c.charCodeAt(x).toString(16)).slice(-2);
        return decodeURIComponent(l);
      };
      PA.tiFKwt = n, e = arguments, PA.SqmyYI = !0;
    }
    var I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      var Q = function(E) {
        this.QFCupe = E, this.pBmmps = [1, 0, 0], this.cFsKML = function() {
          return "newState";
        }, this.OpoVDk = "\\w+ *\\(\\) *{\\w+ *", this.eslcQv = `['|"].+['|"];? *}`;
      };
      Q.prototype.WnQasp = function() {
        var E = new RegExp(this.OpoVDk + this.eslcQv), o = E.test(this.cFsKML.toString()) ? --this.pBmmps[1] : --this.pBmmps[0];
        return this.ZsUMYM(o);
      }, Q.prototype.ZsUMYM = function(E) {
        return ~E ? this.lYPqVj(this.QFCupe) : E;
      }, Q.prototype.lYPqVj = function(E) {
        for (var o = 0, c = this.pBmmps.length; o < c; o++)
          this.pBmmps.push(Math.round(Math.random())), c = this.pBmmps.length;
        return E(this.pBmmps[0]);
      }, new Q(PA).WnQasp(), g = PA.tiFKwt(g), e[r] = g;
    }
    return g;
  }, PA(e, t);
}
Kn();
class zc {
  constructor() {
    O(this, "kernelService", null);
    O(this, "listener");
    var t = PA, A = {};
    A[t(262)] = function(B, g) {
      return B !== g;
    }, A[t(279)] = "WwTDq", A[t(263)] = t(272);
    var i = A;
    this[t(277)] = new BE(), this[t(277)].onProfileDetailInfoChanged = (B) => {
      var g = t;
      i[g(262)](i[g(279)], i[g(263)]) ? B[g(285)] === tt.uid && Object[g(265)](tt, B) : _0x369a16[g(265)](_0x130f87, _0x97d467);
    };
  }
  [$t(258)](t) {
    var A = $t;
    if (this[A(270)] !== null)
      throw new Error(A(266));
    this[A(270)] = t, this[A(270)].addKernelProfileListener(new CA[A(281)](this[A(277)])), this[A(270)][A(261)](tt[A(285)], [1, 0]);
  }
  [$t(271)](t) {
    var i;
    var A = $t;
    return (i = this.kernelService) == null ? void 0 : i[A(286)](new CA.NodeIKernelProfileListener(t));
  }
}
var Gr = XA;
(function(e, t) {
  for (var A = XA, i = e(); ; )
    try {
      var B = parseInt(A(507)) / 1 + parseInt(A(503)) / 2 * (-parseInt(A(499)) / 3) + -parseInt(A(497)) / 4 * (-parseInt(A(498)) / 5) + -parseInt(A(502)) / 6 * (parseInt(A(504)) / 7) + -parseInt(A(508)) / 8 * (-parseInt(A(491)) / 9) + parseInt(A(492)) / 10 + -parseInt(A(501)) / 11;
      if (B === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(AB, 594230);
function AB() {
  var e = ["rgjuBfO", "ntC5mJyYmKzPB2nfqW", "ndeXnJuZnffVz2npBq", "nJiYnKPutvbbsa", "n2TbswXqDa", "C2vHCMnO", "yxbWBhK", "mta5otuZnfrOuNnMvq", "mZCWodC1mNftwNbyza", "txr1Bfe", "rLres28", "zw5QsMW", "u3fjru0", "Dg9tDhjPBMC", "A2vYBMvSu2vYDMLJzq", "oxnWzhPhvW", "nteXntmWmfzZrxD1Cq", "CgDJCwm", "kcGOlISPkYKRksSK", "CuD3BuG", "wMfds3K", "mZjWv0jrswW", "nti1mJbYELruAfm", "mZm5vxDNv0zI"];
  return AB = function() {
    return e;
  }, AB();
}
var Oc = function() {
  var e = XA, t = {};
  t[e(500)] = function(B, g) {
    return B !== g;
  }, t.pgcqc = e(495), t[e(510)] = e(496);
  var A = t, i = !0;
  return function(B, g) {
    var n = i ? function() {
      var I = XA;
      if (A[I(500)](A[I(493)], A[I(510)])) {
        if (g) {
          var r = g[I(506)](B, arguments);
          return g = null, r;
        }
      } else if (_0x4e8b88) {
        var a = _0x210d20[I(506)](_0x56f5f7, arguments);
        return _0x2b1a15 = null, a;
      }
    } : function() {
    };
    return i = !1, n;
  };
}(), Jn = Oc(void 0, function() {
  var e = XA, t = {};
  t[e(512)] = e(494);
  var A = t;
  return Jn[e(489)]()[e(505)](A.SqIEM)[e(489)]().constructor(Jn)[e(505)](A[e(512)]);
});
Jn();
function XA(e, t) {
  var A = AB();
  return XA = function(i, B) {
    i = i - 489;
    var g = A[i];
    if (XA.kKyLIw === void 0) {
      var n = function(E) {
        for (var o = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=", c = "", l = "", u = c + n, C = 0, s, f, h = 0; f = E.charAt(h++); ~f && (s = C % 4 ? s * 64 + f : f, C++ % 4) ? c += u.charCodeAt(h + 10) - 10 !== 0 ? String.fromCharCode(255 & s >> (-2 * C & 6)) : C : 0)
          f = o.indexOf(f);
        for (var x = 0, d = c.length; x < d; x++)
          l += "%" + ("00" + c.charCodeAt(x).toString(16)).slice(-2);
        return decodeURIComponent(l);
      };
      XA.SohTMk = n, e = arguments, XA.kKyLIw = !0;
    }
    var I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      var Q = function(E) {
        this.WdWPkC = E, this.zZSUxj = [1, 0, 0], this.mxRlez = function() {
          return "newState";
        }, this.knEfnm = "\\w+ *\\(\\) *{\\w+ *", this.exExJY = `['|"].+['|"];? *}`;
      };
      Q.prototype.cohsTk = function() {
        var E = new RegExp(this.knEfnm + this.exExJY), o = E.test(this.mxRlez.toString()) ? --this.zZSUxj[1] : --this.zZSUxj[0];
        return this.GDetXM(o);
      }, Q.prototype.GDetXM = function(E) {
        return ~E ? this.uERbIu(this.WdWPkC) : E;
      }, Q.prototype.uERbIu = function(E) {
        for (var o = 0, c = this.zZSUxj.length; o < c; o++)
          this.zZSUxj.push(Math.round(Math.random())), c = this.zZSUxj.length;
        return E(this.zZSUxj[0]);
      }, new Q(XA).cohsTk(), g = XA.SohTMk(g), e[r] = g;
    }
    return g;
  }, XA(e, t);
}
var Lf;
class _c {
  constructor() {
    O(this, Lf, null);
  }
  init(t) {
    var A = Gr, i = {};
    i.enjJl = function(g, n) {
      return g !== n;
    }, i[A(509)] = "ProfileLikeService already initialized!";
    var B = i;
    if (B[A(511)](this[A(490)], null))
      throw new Error(B[A(509)]);
    this[A(490)] = t;
  }
}
Lf = Gr(490);
const xe = oe;
(function(e, t) {
  const A = oe, i = e();
  for (; ; )
    try {
      if (-parseInt(A(417)) / 1 * (parseInt(A(390)) / 2) + -parseInt(A(381)) / 3 + -parseInt(A(376)) / 4 * (parseInt(A(387)) / 5) + -parseInt(A(416)) / 6 + parseInt(A(389)) / 7 + -parseInt(A(404)) / 8 * (parseInt(A(384)) / 9) + parseInt(A(403)) / 10 * (parseInt(A(379)) / 11) === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(eB, 738566);
function eB() {
  const e = ["yLnqBvm", "Ew1JAM8", "uwT2CLC", "odeZmZaWmfjyrgDSrW", "nZjsA0DxA2q", "yxbWBhK", "v1DVuhe", "y29Yzq", "C3bSAxq", "mZi5mMr2uuHbyG", "kcGOlISPkYKRksSK", "CfD3z2q", "mtm4mdmXm2Xpr1Hxra", "BgLZDgvUzxi", "mtK3mtu5n0fvDxPPDG", "zw1PDa", "ChjVzMLSzuXPA2u", "mtmYmtCZndzXu0fNDxq", "z3jVDxa", "mNW1Fdr8mhWXFdm", "nZu1Buf5CgLS", "yNvKzhK", "mte5mJKZm3HZvfPYrq", "mZm5ndzTwvbZvuO", "C2vUzgvYvwLU", "ChjVzMLSzq", "D2fsqwi", "BxnN", "C2vHCMnO", "zefMt2i", "zMPUwK0", "Dg9tDhjPBMC", "CgvLCLvPBG", "quTJwxe", "nhWYFdb8mxWZFdu", "BwvZC2fNzq", "ndmWu2Douhfe", "ogDbue13vW", "zwPVwLq", "u2vYDMLJzxmGywXYzwfKEsbPBML0AwfSAxPLzce", "y29UC3rYDwn0B3i", "Aw5PDeXPC3rLBMvY", "y3LcENC", "BwvZC2fNzs5NCM91Ca", "Aw5PDa", "AxnjBML0"];
  return eB = function() {
    return e;
  }, eB();
}
const jc = function() {
  const e = oe, t = {};
  t.pWwgd = e(401), t[e(396)] = e(413);
  const A = t;
  let i = !0;
  return function(B, g) {
    const n = e;
    if (A[n(396)] === "CHAPv") {
      const I = A[n(378)].split("|");
      let r = 0;
      for (; ; ) {
        switch (I[r++]) {
          case "0":
            this[n(385)] = new _0x5c2617();
            continue;
          case "1":
            this[n(388)] = new _0x141343();
            continue;
          case "2":
            this[n(394)] = new _0x20ace0();
            continue;
          case "3":
            this[n(392)] = new _0x233506();
            continue;
          case "4":
            this[n(374)] = _0x58b6d5;
            continue;
          case "5":
            this[n(383)] = new _0x26cfb1();
            continue;
        }
        break;
      }
    } else {
      const I = i ? function() {
        const r = n;
        if (g) {
          const a = g[r(418)](B, arguments);
          return g = null, a;
        }
      } : function() {
      };
      return i = !1, I;
    }
  };
}(), Wn = jc(void 0, function() {
  const e = oe, t = {};
  t.waRAb = e(377);
  const A = t;
  return Wn[e(398)]()[e(395)](A[e(393)]).toString()[e(407)](Wn).search(A[e(393)]);
});
Wn();
function oe(e, t) {
  const A = eB();
  return oe = function(i, B) {
    i = i - 373;
    let g = A[i];
    if (oe.JNKQxC === void 0) {
      var n = function(Q) {
        const E = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
        let o = "", c = "", l = o + n;
        for (let u = 0, C, s, f = 0; s = Q.charAt(f++); ~s && (C = u % 4 ? C * 64 + s : s, u++ % 4) ? o += l.charCodeAt(f + 10) - 10 !== 0 ? String.fromCharCode(255 & C >> (-2 * u & 6)) : u : 0)
          s = E.indexOf(s);
        for (let u = 0, C = o.length; u < C; u++)
          c += "%" + ("00" + o.charCodeAt(u).toString(16)).slice(-2);
        return decodeURIComponent(c);
      };
      oe.KUgVTY = n, e = arguments, oe.JNKQxC = !0;
    }
    const I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      const Q = function(E) {
        this.JqtKcA = E, this.pAHENo = [1, 0, 0], this.XAANic = function() {
          return "newState";
        }, this.RXPbSJ = "\\w+ *\\(\\) *{\\w+ *", this.uYWYQs = `['|"].+['|"];? *}`;
      };
      Q.prototype.thwfpI = function() {
        const E = new RegExp(this.RXPbSJ + this.uYWYQs), o = E.test(this.XAANic.toString()) ? --this.pAHENo[1] : --this.pAHENo[0];
        return this.vDzsHU(o);
      }, Q.prototype.vDzsHU = function(E) {
        return ~E ? this.oFZmrs(this.JqtKcA) : E;
      }, Q.prototype.oFZmrs = function(E) {
        for (let o = 0, c = this.pAHENo.length; o < c; o++)
          this.pAHENo.push(Math.round(Math.random())), c = this.pAHENo.length;
        return E(this.pAHENo[0]);
      }, new Q(oe).thwfpI(), g = oe.KUgVTY(g), e[r] = g;
    }
    return g;
  }, oe(e, t);
}
var Mf, kf, Kf, Jf, Wf;
class $c {
  constructor(t) {
    O(this, Mf, !1);
    O(this, kf);
    O(this, "msg");
    O(this, "group");
    O(this, Kf);
    O(this, Jf);
    O(this, Wf);
    const A = xe, i = {};
    i.BNFWB = A(386);
    const B = i, g = B.BNFWB[A(375)]("|");
    let n = 0;
    for (; ; ) {
      switch (g[n++]) {
        case "0":
          this[A(388)] = new Pc();
          continue;
        case "1":
          this[A(392)] = new zc();
          continue;
        case "2":
          this[A(374)] = t;
          continue;
        case "3":
          this[A(383)] = new _c();
          continue;
        case "4":
          this[A(385)] = new Vc();
          continue;
        case "5":
          this[A(394)] = new qc();
          continue;
      }
      break;
    }
  }
  [(Mf = xe(412), kf = xe(374), Kf = xe(388), Jf = xe(392), Wf = xe(383), xe(411))](t, A, i, B, g) {
    const n = xe, I = {};
    I[n(405)] = "1|2|0|6|5|4|7|3", I.cyBzw = n(406);
    const r = I, a = r[n(405)][n(375)]("|");
    let Q = 0;
    for (; ; ) {
      switch (a[Q++]) {
        case "0":
          this.group.init(A);
          continue;
        case "1":
          if (this.isInit)
            throw new Error(r[n(409)]);
          continue;
        case "2":
          this[n(394)][n(411)](t);
          continue;
        case "3":
          this[n(412)] = !0;
          continue;
        case "4":
          this[n(383)][n(411)](g);
          continue;
        case "5":
          this[n(392)][n(411)](B);
          continue;
        case "6":
          this[n(388)][n(411)](i);
          continue;
        case "7":
          this.initListener();
          continue;
      }
      break;
    }
  }
  [xe(408)]() {
    const t = xe, A = {};
    A[t(415)] = "(((.+)+)+)+$", A[t(373)] = "BlYwp", A[t(397)] = t(402), A[t(400)] = function(B, g) {
      return B !== g;
    }, A.ymcjo = t(410);
    const i = A;
    this[t(394)][t(380)].onRecvMsg = (B) => {
      const g = t;
      if (i[g(373)] === i[g(373)])
        for (const n of B)
          this[g(374)][g(382)](i[g(397)], n), i.AKcYq(n[g(399)], n[g(391)]) ? this[g(374)].emit(i[g(414)], n) : this[g(374)][g(382)]("message.private", n);
      else
        return _0x3ed0e0[g(398)]()[g(395)](iYhQCs[g(415)])[g(398)]().constructor(_0x581c0b).search(iYhQCs[g(415)]);
    };
  }
}
var Ai = { exports: {} }, Gg, Fr;
function Af() {
  if (Fr)
    return Gg;
  Fr = 1;
  var e = 1e3, t = e * 60, A = t * 60, i = A * 24, B = i * 7, g = i * 365.25;
  Gg = function(Q, E) {
    E = E || {};
    var o = typeof Q;
    if (o === "string" && Q.length > 0)
      return n(Q);
    if (o === "number" && isFinite(Q))
      return E.long ? r(Q) : I(Q);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(Q)
    );
  };
  function n(Q) {
    if (Q = String(Q), !(Q.length > 100)) {
      var E = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        Q
      );
      if (E) {
        var o = parseFloat(E[1]), c = (E[2] || "ms").toLowerCase();
        switch (c) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return o * g;
          case "weeks":
          case "week":
          case "w":
            return o * B;
          case "days":
          case "day":
          case "d":
            return o * i;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return o * A;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return o * t;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return o * e;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return o;
          default:
            return;
        }
      }
    }
  }
  function I(Q) {
    var E = Math.abs(Q);
    return E >= i ? Math.round(Q / i) + "d" : E >= A ? Math.round(Q / A) + "h" : E >= t ? Math.round(Q / t) + "m" : E >= e ? Math.round(Q / e) + "s" : Q + "ms";
  }
  function r(Q) {
    var E = Math.abs(Q);
    return E >= i ? a(Q, E, i, "day") : E >= A ? a(Q, E, A, "hour") : E >= t ? a(Q, E, t, "minute") : E >= e ? a(Q, E, e, "second") : Q + " ms";
  }
  function a(Q, E, o, c) {
    var l = E >= o * 1.5;
    return Math.round(Q / o) + " " + c + (l ? "s" : "");
  }
  return Gg;
}
var Fg, Rr;
function ef() {
  if (Rr)
    return Fg;
  Rr = 1;
  function e(t) {
    i.debug = i, i.default = i, i.coerce = a, i.disable = n, i.enable = g, i.enabled = I, i.humanize = Af(), i.destroy = Q, Object.keys(t).forEach((E) => {
      i[E] = t[E];
    }), i.names = [], i.skips = [], i.formatters = {};
    function A(E) {
      let o = 0;
      for (let c = 0; c < E.length; c++)
        o = (o << 5) - o + E.charCodeAt(c), o |= 0;
      return i.colors[Math.abs(o) % i.colors.length];
    }
    i.selectColor = A;
    function i(E) {
      let o, c = null, l, u;
      function C(...s) {
        if (!C.enabled)
          return;
        const f = C, h = Number(/* @__PURE__ */ new Date()), x = h - (o || h);
        f.diff = x, f.prev = o, f.curr = h, o = h, s[0] = i.coerce(s[0]), typeof s[0] != "string" && s.unshift("%O");
        let d = 0;
        s[0] = s[0].replace(/%([a-zA-Z%])/g, (H, v) => {
          if (H === "%%")
            return "%";
          d++;
          const N = i.formatters[v];
          if (typeof N == "function") {
            const M = s[d];
            H = N.call(f, M), s.splice(d, 1), d--;
          }
          return H;
        }), i.formatArgs.call(f, s), (f.log || i.log).apply(f, s);
      }
      return C.namespace = E, C.useColors = i.useColors(), C.color = i.selectColor(E), C.extend = B, C.destroy = i.destroy, Object.defineProperty(C, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => c !== null ? c : (l !== i.namespaces && (l = i.namespaces, u = i.enabled(E)), u),
        set: (s) => {
          c = s;
        }
      }), typeof i.init == "function" && i.init(C), C;
    }
    function B(E, o) {
      const c = i(this.namespace + (typeof o > "u" ? ":" : o) + E);
      return c.log = this.log, c;
    }
    function g(E) {
      i.save(E), i.namespaces = E, i.names = [], i.skips = [];
      let o;
      const c = (typeof E == "string" ? E : "").split(/[\s,]+/), l = c.length;
      for (o = 0; o < l; o++)
        c[o] && (E = c[o].replace(/\*/g, ".*?"), E[0] === "-" ? i.skips.push(new RegExp("^" + E.slice(1) + "$")) : i.names.push(new RegExp("^" + E + "$")));
    }
    function n() {
      const E = [
        ...i.names.map(r),
        ...i.skips.map(r).map((o) => "-" + o)
      ].join(",");
      return i.enable(""), E;
    }
    function I(E) {
      if (E[E.length - 1] === "*")
        return !0;
      let o, c;
      for (o = 0, c = i.skips.length; o < c; o++)
        if (i.skips[o].test(E))
          return !1;
      for (o = 0, c = i.names.length; o < c; o++)
        if (i.names[o].test(E))
          return !0;
      return !1;
    }
    function r(E) {
      return E.toString().substring(2, E.toString().length - 2).replace(/\.\*\?$/, "*");
    }
    function a(E) {
      return E instanceof Error ? E.stack || E.message : E;
    }
    function Q() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return i.enable(i.load()), i;
  }
  return Fg = e, Fg;
}
var Sr;
function De() {
  return Sr || (Sr = 1, function(e, t) {
    t.formatArgs = i, t.save = B, t.load = g, t.useColors = A, t.storage = n(), t.destroy = /* @__PURE__ */ (() => {
      let r = !1;
      return () => {
        r || (r = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), t.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function A() {
      return typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs) ? !0 : typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/) ? !1 : typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function i(r) {
      if (r[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + r[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors)
        return;
      const a = "color: " + this.color;
      r.splice(1, 0, a, "color: inherit");
      let Q = 0, E = 0;
      r[0].replace(/%[a-zA-Z%]/g, (o) => {
        o !== "%%" && (Q++, o === "%c" && (E = Q));
      }), r.splice(E, 0, a);
    }
    t.log = console.debug || console.log || (() => {
    });
    function B(r) {
      try {
        r ? t.storage.setItem("debug", r) : t.storage.removeItem("debug");
      } catch {
      }
    }
    function g() {
      let r;
      try {
        r = t.storage.getItem("debug");
      } catch {
      }
      return !r && typeof process < "u" && "env" in process && (r = process.env.DEBUG), r;
    }
    function n() {
      try {
        return localStorage;
      } catch {
      }
    }
    e.exports = ef()(t);
    const { formatters: I } = e.exports;
    I.j = function(r) {
      try {
        return JSON.stringify(r);
      } catch (a) {
        return "[UnexpectedJSONParseError]: " + a.message;
      }
    };
  }(Ai, Ai.exports)), Ai.exports;
}
var Rg, br;
function tf() {
  if (br)
    return Rg;
  br = 1, Rg = t;
  function e(i) {
    return i instanceof Buffer ? Buffer.from(i) : new i.constructor(i.buffer.slice(), i.byteOffset, i.length);
  }
  function t(i) {
    if (i = i || {}, i.circles)
      return A(i);
    return i.proto ? n : g;
    function B(I, r) {
      for (var a = Object.keys(I), Q = new Array(a.length), E = 0; E < a.length; E++) {
        var o = a[E], c = I[o];
        typeof c != "object" || c === null ? Q[o] = c : c instanceof Date ? Q[o] = new Date(c) : ArrayBuffer.isView(c) ? Q[o] = e(c) : Q[o] = r(c);
      }
      return Q;
    }
    function g(I) {
      if (typeof I != "object" || I === null)
        return I;
      if (I instanceof Date)
        return new Date(I);
      if (Array.isArray(I))
        return B(I, g);
      if (I instanceof Map)
        return new Map(B(Array.from(I), g));
      if (I instanceof Set)
        return new Set(B(Array.from(I), g));
      var r = {};
      for (var a in I)
        if (Object.hasOwnProperty.call(I, a) !== !1) {
          var Q = I[a];
          typeof Q != "object" || Q === null ? r[a] = Q : Q instanceof Date ? r[a] = new Date(Q) : Q instanceof Map ? r[a] = new Map(B(Array.from(Q), g)) : Q instanceof Set ? r[a] = new Set(B(Array.from(Q), g)) : ArrayBuffer.isView(Q) ? r[a] = e(Q) : r[a] = g(Q);
        }
      return r;
    }
    function n(I) {
      if (typeof I != "object" || I === null)
        return I;
      if (I instanceof Date)
        return new Date(I);
      if (Array.isArray(I))
        return B(I, n);
      if (I instanceof Map)
        return new Map(B(Array.from(I), n));
      if (I instanceof Set)
        return new Set(B(Array.from(I), n));
      var r = {};
      for (var a in I) {
        var Q = I[a];
        typeof Q != "object" || Q === null ? r[a] = Q : Q instanceof Date ? r[a] = new Date(Q) : Q instanceof Map ? r[a] = new Map(B(Array.from(Q), n)) : Q instanceof Set ? r[a] = new Set(B(Array.from(Q), n)) : ArrayBuffer.isView(Q) ? r[a] = e(Q) : r[a] = n(Q);
      }
      return r;
    }
  }
  function A(i) {
    var B = [], g = [];
    return i.proto ? r : I;
    function n(a, Q) {
      for (var E = Object.keys(a), o = new Array(E.length), c = 0; c < E.length; c++) {
        var l = E[c], u = a[l];
        if (typeof u != "object" || u === null)
          o[l] = u;
        else if (u instanceof Date)
          o[l] = new Date(u);
        else if (ArrayBuffer.isView(u))
          o[l] = e(u);
        else {
          var C = B.indexOf(u);
          C !== -1 ? o[l] = g[C] : o[l] = Q(u);
        }
      }
      return o;
    }
    function I(a) {
      if (typeof a != "object" || a === null)
        return a;
      if (a instanceof Date)
        return new Date(a);
      if (Array.isArray(a))
        return n(a, I);
      if (a instanceof Map)
        return new Map(n(Array.from(a), I));
      if (a instanceof Set)
        return new Set(n(Array.from(a), I));
      var Q = {};
      B.push(a), g.push(Q);
      for (var E in a)
        if (Object.hasOwnProperty.call(a, E) !== !1) {
          var o = a[E];
          if (typeof o != "object" || o === null)
            Q[E] = o;
          else if (o instanceof Date)
            Q[E] = new Date(o);
          else if (o instanceof Map)
            Q[E] = new Map(n(Array.from(o), I));
          else if (o instanceof Set)
            Q[E] = new Set(n(Array.from(o), I));
          else if (ArrayBuffer.isView(o))
            Q[E] = e(o);
          else {
            var c = B.indexOf(o);
            c !== -1 ? Q[E] = g[c] : Q[E] = I(o);
          }
        }
      return B.pop(), g.pop(), Q;
    }
    function r(a) {
      if (typeof a != "object" || a === null)
        return a;
      if (a instanceof Date)
        return new Date(a);
      if (Array.isArray(a))
        return n(a, r);
      if (a instanceof Map)
        return new Map(n(Array.from(a), r));
      if (a instanceof Set)
        return new Set(n(Array.from(a), r));
      var Q = {};
      B.push(a), g.push(Q);
      for (var E in a) {
        var o = a[E];
        if (typeof o != "object" || o === null)
          Q[E] = o;
        else if (o instanceof Date)
          Q[E] = new Date(o);
        else if (o instanceof Map)
          Q[E] = new Map(n(Array.from(o), r));
        else if (o instanceof Set)
          Q[E] = new Set(n(Array.from(o), r));
        else if (ArrayBuffer.isView(o))
          Q[E] = e(o);
        else {
          var c = B.indexOf(o);
          c !== -1 ? Q[E] = g[c] : Q[E] = r(o);
        }
      }
      return B.pop(), g.pop(), Q;
    }
  }
  return Rg;
}
var Sg, Nr;
function Kt() {
  if (Nr)
    return Sg;
  Nr = 1;
  const e = Bt, t = De()("log4js:configuration"), A = [], i = [], B = (o) => !o, g = (o) => o && typeof o == "object" && !Array.isArray(o), n = (o) => /^[A-Za-z][A-Za-z0-9_]*$/g.test(o), I = (o) => o && typeof o == "number" && Number.isInteger(o), r = (o) => {
    i.push(o), t(`Added listener, now ${i.length} listeners`);
  }, a = (o) => {
    A.push(o), t(
      `Added pre-processing listener, now ${A.length} listeners`
    );
  }, Q = (o, c, l) => {
    (Array.isArray(c) ? c : [c]).forEach((C) => {
      if (C)
        throw new Error(
          `Problem with log4js configuration: (${e.inspect(o, {
            depth: 5
          })}) - ${l}`
        );
    });
  };
  return Sg = {
    configure: (o) => {
      t("New configuration to be validated: ", o), Q(o, B(g(o)), "must be an object."), t(`Calling pre-processing listeners (${A.length})`), A.forEach((c) => c(o)), t("Configuration pre-processing finished."), t(`Calling configuration listeners (${i.length})`), i.forEach((c) => c(o)), t("Configuration finished.");
    },
    addListener: r,
    addPreProcessingListener: a,
    throwExceptionIf: Q,
    anObject: g,
    anInteger: I,
    validIdentifier: n,
    not: B
  }, Sg;
}
var bg = { exports: {} }, Ur;
function Bf() {
  return Ur || (Ur = 1, function(e) {
    function t(a, Q) {
      for (var E = a.toString(); E.length < Q; )
        E = "0" + E;
      return E;
    }
    function A(a) {
      return t(a, 2);
    }
    function i(a) {
      var Q = Math.abs(a), E = String(Math.floor(Q / 60)), o = String(Q % 60);
      return E = ("0" + E).slice(-2), o = ("0" + o).slice(-2), a === 0 ? "Z" : (a < 0 ? "+" : "-") + E + ":" + o;
    }
    function B(a, Q) {
      typeof a != "string" && (Q = a, a = e.exports.ISO8601_FORMAT), Q || (Q = e.exports.now());
      var E = A(Q.getDate()), o = A(Q.getMonth() + 1), c = A(Q.getFullYear()), l = A(c.substring(2, 4)), u = a.indexOf("yyyy") > -1 ? c : l, C = A(Q.getHours()), s = A(Q.getMinutes()), f = A(Q.getSeconds()), h = t(Q.getMilliseconds(), 3), x = i(Q.getTimezoneOffset()), d = a.replace(/dd/g, E).replace(/MM/g, o).replace(/y{1,4}/g, u).replace(/hh/g, C).replace(/mm/g, s).replace(/ss/g, f).replace(/SSS/g, h).replace(/O/g, x);
      return d;
    }
    function g(a, Q, E, o) {
      a["set" + (o ? "" : "UTC") + Q](E);
    }
    function n(a, Q, E) {
      var o = a.indexOf("O") < 0, c = !1, l = [
        {
          pattern: /y{1,4}/,
          regexp: "\\d{1,4}",
          fn: function(x, d) {
            g(x, "FullYear", d, o);
          }
        },
        {
          pattern: /MM/,
          regexp: "\\d{1,2}",
          fn: function(x, d) {
            g(x, "Month", d - 1, o), x.getMonth() !== d - 1 && (c = !0);
          }
        },
        {
          pattern: /dd/,
          regexp: "\\d{1,2}",
          fn: function(x, d) {
            c && g(x, "Month", x.getMonth() - 1, o), g(x, "Date", d, o);
          }
        },
        {
          pattern: /hh/,
          regexp: "\\d{1,2}",
          fn: function(x, d) {
            g(x, "Hours", d, o);
          }
        },
        {
          pattern: /mm/,
          regexp: "\\d\\d",
          fn: function(x, d) {
            g(x, "Minutes", d, o);
          }
        },
        {
          pattern: /ss/,
          regexp: "\\d\\d",
          fn: function(x, d) {
            g(x, "Seconds", d, o);
          }
        },
        {
          pattern: /SSS/,
          regexp: "\\d\\d\\d",
          fn: function(x, d) {
            g(x, "Milliseconds", d, o);
          }
        },
        {
          pattern: /O/,
          regexp: "[+-]\\d{1,2}:?\\d{2}?|Z",
          fn: function(x, d) {
            d === "Z" ? d = 0 : d = d.replace(":", "");
            var m = Math.abs(d), H = (d > 0 ? -1 : 1) * (m % 100 + Math.floor(m / 100) * 60);
            x.setUTCMinutes(x.getUTCMinutes() + H);
          }
        }
      ], u = l.reduce(
        function(x, d) {
          return d.pattern.test(x.regexp) ? (d.index = x.regexp.match(d.pattern).index, x.regexp = x.regexp.replace(d.pattern, "(" + d.regexp + ")")) : d.index = -1, x;
        },
        { regexp: a, index: [] }
      ), C = l.filter(function(x) {
        return x.index > -1;
      });
      C.sort(function(x, d) {
        return x.index - d.index;
      });
      var s = new RegExp(u.regexp), f = s.exec(Q);
      if (f) {
        var h = E || e.exports.now();
        return C.forEach(function(x, d) {
          x.fn(h, f[d + 1]);
        }), h;
      }
      throw new Error(
        "String '" + Q + "' could not be parsed as '" + a + "'"
      );
    }
    function I(a, Q, E) {
      if (!a)
        throw new Error("pattern must be supplied");
      return n(a, Q, E);
    }
    function r() {
      return /* @__PURE__ */ new Date();
    }
    e.exports = B, e.exports.asString = B, e.exports.parse = I, e.exports.now = r, e.exports.ISO8601_FORMAT = "yyyy-MM-ddThh:mm:ss.SSS", e.exports.ISO8601_WITH_TZ_OFFSET_FORMAT = "yyyy-MM-ddThh:mm:ss.SSSO", e.exports.DATETIME_FORMAT = "dd MM yyyy hh:mm:ss.SSS", e.exports.ABSOLUTETIME_FORMAT = "hh:mm:ss.SSS";
  }(bg)), bg.exports;
}
var Ng, vr;
function YQ() {
  if (vr)
    return Ng;
  vr = 1;
  const e = Bf(), t = tE, A = Bt, i = vA, B = lo, g = De()("log4js:layouts"), n = {
    // styles
    bold: [1, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    // grayscale
    white: [37, 39],
    grey: [90, 39],
    black: [90, 39],
    // colors
    blue: [34, 39],
    cyan: [36, 39],
    green: [32, 39],
    magenta: [35, 39],
    red: [91, 39],
    yellow: [33, 39]
  };
  function I(s) {
    return s ? `\x1B[${n[s][0]}m` : "";
  }
  function r(s) {
    return s ? `\x1B[${n[s][1]}m` : "";
  }
  function a(s, f) {
    return I(f) + s + r(f);
  }
  function Q(s, f) {
    return a(
      A.format(
        "[%s] [%s] %s - ",
        e.asString(s.startTime),
        s.level.toString(),
        s.categoryName
      ),
      f
    );
  }
  function E(s) {
    return Q(s) + A.format(...s.data);
  }
  function o(s) {
    return Q(s, s.level.colour) + A.format(...s.data);
  }
  function c(s) {
    return A.format(...s.data);
  }
  function l(s) {
    return s.data[0];
  }
  function u(s, f) {
    const h = "%r %p %c - %m%n", x = /%(-?[0-9]+)?(\.?-?[0-9]+)?([[\]cdhmnprzxXyflosCMAF%])(\{([^}]+)\})?|([^%]+)/;
    s = s || h;
    function d(w, S) {
      let U = w.categoryName;
      if (S) {
        const X = parseInt(S, 10), k = U.split(".");
        X < k.length && (U = k.slice(k.length - X).join("."));
      }
      return U;
    }
    function m(w, S) {
      let U = e.ISO8601_FORMAT;
      if (S)
        switch (U = S, U) {
          case "ISO8601":
          case "ISO8601_FORMAT":
            U = e.ISO8601_FORMAT;
            break;
          case "ISO8601_WITH_TZ_OFFSET":
          case "ISO8601_WITH_TZ_OFFSET_FORMAT":
            U = e.ISO8601_WITH_TZ_OFFSET_FORMAT;
            break;
          case "ABSOLUTE":
            process.emitWarning(
              "Pattern %d{ABSOLUTE} is deprecated in favor of %d{ABSOLUTETIME}. Please use %d{ABSOLUTETIME} instead.",
              "DeprecationWarning",
              "log4js-node-DEP0003"
            ), g(
              "[log4js-node-DEP0003]",
              "DEPRECATION: Pattern %d{ABSOLUTE} is deprecated and replaced by %d{ABSOLUTETIME}."
            );
          case "ABSOLUTETIME":
          case "ABSOLUTETIME_FORMAT":
            U = e.ABSOLUTETIME_FORMAT;
            break;
          case "DATE":
            process.emitWarning(
              "Pattern %d{DATE} is deprecated due to the confusion it causes when used. Please use %d{DATETIME} instead.",
              "DeprecationWarning",
              "log4js-node-DEP0004"
            ), g(
              "[log4js-node-DEP0004]",
              "DEPRECATION: Pattern %d{DATE} is deprecated and replaced by %d{DATETIME}."
            );
          case "DATETIME":
          case "DATETIME_FORMAT":
            U = e.DATETIME_FORMAT;
            break;
        }
      return e.asString(U, w.startTime);
    }
    function H() {
      return t.hostname().toString();
    }
    function v(w, S) {
      let U = w.data;
      if (S) {
        const [X, k] = S.split(",");
        U = U.slice(X, k);
      }
      return A.format(...U);
    }
    function N() {
      return t.EOL;
    }
    function M(w) {
      return w.level.toString();
    }
    function Z(w) {
      return e.asString("hh:mm:ss", w.startTime);
    }
    function V(w) {
      return I(w.level.colour);
    }
    function EA(w) {
      return r(w.level.colour);
    }
    function _() {
      return "%";
    }
    function gA(w) {
      return w && w.pid ? w.pid.toString() : process.pid.toString();
    }
    function cA() {
      return gA();
    }
    function sA(w, S) {
      return typeof f[S] < "u" ? typeof f[S] == "function" ? f[S](w) : f[S] : null;
    }
    function LA(w, S) {
      const U = w.context[S];
      return typeof U < "u" ? typeof U == "function" ? U(w) : U : null;
    }
    function _A(w, S) {
      let U = w.fileName || "";
      if (U = function(k) {
        const iA = "file://";
        return k.startsWith(iA) && (typeof B.fileURLToPath == "function" ? k = B.fileURLToPath(k) : (k = i.normalize(
          k.replace(new RegExp(`^${iA}`), "")
        ), process.platform === "win32" && (k.startsWith("\\") ? k = k.slice(1) : k = i.sep + i.sep + k))), k;
      }(U), S) {
        const k = parseInt(S, 10), iA = U.split(i.sep);
        iA.length > k && (U = iA.slice(-k).join(i.sep));
      }
      return U;
    }
    function pe(w) {
      return w.lineNumber ? `${w.lineNumber}` : "";
    }
    function ce(w) {
      return w.columnNumber ? `${w.columnNumber}` : "";
    }
    function yA(w) {
      return w.callStack || "";
    }
    function MA(w) {
      return w.className || "";
    }
    function ve(w) {
      return w.functionName || "";
    }
    function Oe(w) {
      return w.functionAlias || "";
    }
    function R(w) {
      return w.callerName || "";
    }
    const F = {
      c: d,
      d: m,
      h: H,
      m: v,
      n: N,
      p: M,
      r: Z,
      "[": V,
      "]": EA,
      y: cA,
      z: gA,
      "%": _,
      x: sA,
      X: LA,
      f: _A,
      l: pe,
      o: ce,
      s: yA,
      C: MA,
      M: ve,
      A: Oe,
      F: R
    };
    function Y(w, S, U) {
      return F[w](S, U);
    }
    function P(w, S) {
      let U;
      return w ? (U = parseInt(w.slice(1), 10), U > 0 ? S.slice(0, U) : S.slice(U)) : S;
    }
    function j(w, S) {
      let U;
      if (w)
        if (w.charAt(0) === "-")
          for (U = parseInt(w.slice(1), 10); S.length < U; )
            S += " ";
        else
          for (U = parseInt(w, 10); S.length < U; )
            S = ` ${S}`;
      return S;
    }
    function D(w, S, U) {
      let X = w;
      return X = P(S, X), X = j(U, X), X;
    }
    return function(w) {
      let S = "", U, X = s;
      for (; (U = x.exec(X)) !== null; ) {
        const k = U[1], iA = U[2], kA = U[3], He = U[5], _e = U[6];
        if (_e)
          S += _e.toString();
        else {
          const mA = Y(
            kA,
            w,
            He
          );
          S += D(mA, iA, k);
        }
        X = X.slice(U.index + U[0].length);
      }
      return S;
    };
  }
  const C = {
    messagePassThrough() {
      return c;
    },
    basic() {
      return E;
    },
    colored() {
      return o;
    },
    coloured() {
      return o;
    },
    pattern(s) {
      return u(s && s.pattern, s && s.tokens);
    },
    dummy() {
      return l;
    }
  };
  return Ng = {
    basicLayout: E,
    messagePassThroughLayout: c,
    patternLayout: u,
    colouredLayout: o,
    coloredLayout: o,
    dummyLayout: l,
    addLayout(s, f) {
      C[s] = f;
    },
    layout(s, f) {
      return C[s] && C[s](f);
    }
  }, Ng;
}
var Ug, Hr;
function dt() {
  if (Hr)
    return Ug;
  Hr = 1;
  const e = Kt(), t = [
    "white",
    "grey",
    "black",
    "blue",
    "cyan",
    "green",
    "magenta",
    "red",
    "yellow"
  ];
  class A {
    constructor(B, g, n) {
      this.level = B, this.levelStr = g, this.colour = n;
    }
    toString() {
      return this.levelStr;
    }
    /**
     * converts given String to corresponding Level
     * @param {(Level|string)} sArg -- String value of Level OR Log4js.Level
     * @param {Level} [defaultLevel] -- default Level, if no String representation
     * @return {Level}
     */
    static getLevel(B, g) {
      return B ? B instanceof A ? B : (B instanceof Object && B.levelStr && (B = B.levelStr), A[B.toString().toUpperCase()] || g) : g;
    }
    static addLevels(B) {
      B && (Object.keys(B).forEach((n) => {
        const I = n.toUpperCase();
        A[I] = new A(
          B[n].value,
          I,
          B[n].colour
        );
        const r = A.levels.findIndex(
          (a) => a.levelStr === I
        );
        r > -1 ? A.levels[r] = A[I] : A.levels.push(A[I]);
      }), A.levels.sort((n, I) => n.level - I.level));
    }
    isLessThanOrEqualTo(B) {
      return typeof B == "string" && (B = A.getLevel(B)), this.level <= B.level;
    }
    isGreaterThanOrEqualTo(B) {
      return typeof B == "string" && (B = A.getLevel(B)), this.level >= B.level;
    }
    isEqualTo(B) {
      return typeof B == "string" && (B = A.getLevel(B)), this.level === B.level;
    }
  }
  return A.levels = [], A.addLevels({
    ALL: { value: Number.MIN_VALUE, colour: "grey" },
    TRACE: { value: 5e3, colour: "blue" },
    DEBUG: { value: 1e4, colour: "cyan" },
    INFO: { value: 2e4, colour: "green" },
    WARN: { value: 3e4, colour: "yellow" },
    ERROR: { value: 4e4, colour: "red" },
    FATAL: { value: 5e4, colour: "magenta" },
    MARK: { value: 9007199254740992, colour: "grey" },
    // 2^53
    OFF: { value: Number.MAX_VALUE, colour: "grey" }
  }), e.addListener((i) => {
    const B = i.levels;
    B && (e.throwExceptionIf(
      i,
      e.not(e.anObject(B)),
      "levels must be an object"
    ), Object.keys(B).forEach((n) => {
      e.throwExceptionIf(
        i,
        e.not(e.validIdentifier(n)),
        `level name "${n}" is not a valid identifier (must start with a letter, only contain A-Z,a-z,0-9,_)`
      ), e.throwExceptionIf(
        i,
        e.not(e.anObject(B[n])),
        `level "${n}" must be an object`
      ), e.throwExceptionIf(
        i,
        e.not(B[n].value),
        `level "${n}" must have a 'value' property`
      ), e.throwExceptionIf(
        i,
        e.not(e.anInteger(B[n].value)),
        `level "${n}".value must have an integer value`
      ), e.throwExceptionIf(
        i,
        e.not(B[n].colour),
        `level "${n}" must have a 'colour' property`
      ), e.throwExceptionIf(
        i,
        e.not(t.indexOf(B[n].colour) > -1),
        `level "${n}".colour must be one of ${t.join(", ")}`
      );
    }));
  }), e.addListener((i) => {
    A.addLevels(i.levels);
  }), Ug = A, Ug;
}
var ei = { exports: {} }, vg, Yr;
function QI() {
  if (Yr)
    return vg;
  Yr = 1;
  const e = () => !0, t = [];
  return vg = {
    onlyOnMaster: (i, B) => i(),
    isMaster: e,
    send: (i) => {
      t.forEach((B) => B(i));
    },
    onMessage: (i) => {
      t.push(i);
    }
  }, vg;
}
var Hg = {}, Lr;
function gf() {
  if (Lr)
    return Hg;
  Lr = 1;
  function e(B) {
    if (typeof B == "number" && Number.isInteger(B))
      return B;
    const g = {
      K: 1024,
      M: 1024 * 1024,
      G: 1024 * 1024 * 1024
    }, n = Object.keys(g), I = B.slice(-1).toLocaleUpperCase(), r = B.slice(0, -1).trim();
    if (n.indexOf(I) < 0 || !Number.isInteger(Number(r)))
      throw Error(`maxLogSize: "${B}" is invalid`);
    return r * g[I];
  }
  function t(B, g) {
    const n = Object.assign({}, g);
    return Object.keys(B).forEach((I) => {
      n[I] && (n[I] = B[I](g[I]));
    }), n;
  }
  function A(B) {
    return t({
      maxLogSize: e
    }, B);
  }
  const i = {
    dateFile: A,
    file: A,
    fileSync: A
  };
  return Hg.modifyConfig = (B) => i[B.type] ? i[B.type](B) : B, Hg;
}
var Yg = {}, Mr;
function nf() {
  if (Mr)
    return Yg;
  Mr = 1;
  const e = console.log.bind(console);
  function t(i, B) {
    return (g) => {
      e(i(g, B));
    };
  }
  function A(i, B) {
    let g = B.colouredLayout;
    return i.layout && (g = B.layout(i.layout.type, i.layout)), t(g, i.timezoneOffset);
  }
  return Yg.configure = A, Yg;
}
var Lg = {}, kr;
function If() {
  if (kr)
    return Lg;
  kr = 1;
  function e(A, i) {
    return (B) => {
      process.stdout.write(`${A(B, i)}
`);
    };
  }
  function t(A, i) {
    let B = i.colouredLayout;
    return A.layout && (B = i.layout(A.layout.type, A.layout)), e(B, A.timezoneOffset);
  }
  return Lg.configure = t, Lg;
}
var Mg = {}, Kr;
function rf() {
  if (Kr)
    return Mg;
  Kr = 1;
  function e(A, i) {
    return (B) => {
      process.stderr.write(`${A(B, i)}
`);
    };
  }
  function t(A, i) {
    let B = i.colouredLayout;
    return A.layout && (B = i.layout(A.layout.type, A.layout)), e(B, A.timezoneOffset);
  }
  return Mg.configure = t, Mg;
}
var kg = {}, Jr;
function Ef() {
  if (Jr)
    return kg;
  Jr = 1;
  function e(A, i, B, g) {
    const n = g.getLevel(A), I = g.getLevel(i, g.FATAL);
    return (r) => {
      const a = r.level;
      n.isLessThanOrEqualTo(a) && I.isGreaterThanOrEqualTo(a) && B(r);
    };
  }
  function t(A, i, B, g) {
    const n = B(A.appender);
    return e(A.level, A.maxLevel, n, g);
  }
  return kg.configure = t, kg;
}
var Kg = {}, Wr;
function Qf() {
  if (Wr)
    return Kg;
  Wr = 1;
  const e = De()("log4js:categoryFilter");
  function t(i, B) {
    return typeof i == "string" && (i = [i]), (g) => {
      e(`Checking ${g.categoryName} against ${i}`), i.indexOf(g.categoryName) === -1 && (e("Not excluded, sending to appender"), B(g));
    };
  }
  function A(i, B, g) {
    const n = g(i.appender);
    return t(i.exclude, n);
  }
  return Kg.configure = A, Kg;
}
var Jg = {}, qr;
function of() {
  if (qr)
    return Jg;
  qr = 1;
  const e = De()("log4js:noLogFilter");
  function t(B) {
    return B.filter((n) => n != null && n !== "");
  }
  function A(B, g) {
    return (n) => {
      e(`Checking data: ${n.data} against filters: ${B}`), typeof B == "string" && (B = [B]), B = t(B);
      const I = new RegExp(B.join("|"), "i");
      (B.length === 0 || n.data.findIndex((r) => I.test(r)) < 0) && (e("Not excluded, sending to appender"), g(n));
    };
  }
  function i(B, g, n) {
    const I = n(B.appender);
    return A(B.exclude, I);
  }
  return Jg.configure = i, Jg;
}
var Zr = {}, Vr;
function Wg() {
  return Vr || (Vr = 1), Zr;
}
var qg = {}, Tr;
function af() {
  if (Tr)
    return qg;
  Tr = 1;
  const e = De()("log4js:tcp"), t = wo;
  function A(B, g) {
    let n = !1;
    const I = [];
    let r, a = 3, Q = "__LOG4JS__";
    function E(u) {
      e("Writing log event to socket"), n = r.write(`${g(u)}${Q}`, "utf8");
    }
    function o() {
      let u;
      for (e("emptying buffer"); u = I.shift(); )
        E(u);
    }
    function c() {
      e(
        `appender creating socket to ${B.host || "localhost"}:${B.port || 5e3}`
      ), Q = `${B.endMsg || "__LOG4JS__"}`, r = t.createConnection(
        B.port || 5e3,
        B.host || "localhost"
      ), r.on("connect", () => {
        e("socket connected"), o(), n = !0;
      }), r.on("drain", () => {
        e("drain event received, emptying buffer"), n = !0, o();
      }), r.on("timeout", r.end.bind(r)), r.on("error", (u) => {
        e("connection error", u), n = !1, o();
      }), r.on("close", c);
    }
    c();
    function l(u) {
      n ? E(u) : (e("buffering log event because it cannot write at the moment"), I.push(u));
    }
    return l.shutdown = function(u) {
      e("shutdown called"), I.length && a ? (e("buffer has items, waiting 100ms to empty"), a -= 1, setTimeout(() => {
        l.shutdown(u);
      }, 100)) : (r.removeAllListeners("close"), r.end(u));
    }, l;
  }
  function i(B, g) {
    e(`configure with config = ${B}`);
    let n = function(I) {
      return I.serialise();
    };
    return B.layout && (n = g.layout(B.layout.type, B.layout)), A(B, n);
  }
  return qg.configure = i, qg;
}
var Pr;
function LQ() {
  if (Pr)
    return ei.exports;
  Pr = 1;
  const e = vA, t = De()("log4js:appenders"), A = Kt(), i = QI(), B = dt(), g = YQ(), n = gf(), I = /* @__PURE__ */ new Map();
  I.set("console", nf()), I.set("stdout", If()), I.set("stderr", rf()), I.set("logLevelFilter", Ef()), I.set("categoryFilter", Qf()), I.set("noLogFilter", of()), I.set("file", Wg()), I.set("dateFile", Wg()), I.set("fileSync", Wg()), I.set("tcp", af());
  const r = /* @__PURE__ */ new Map(), a = (C, s) => {
    let f;
    try {
      const h = `${C}.cjs`;
      f = require.resolve(h), t("Loading module from ", h);
    } catch {
      f = C, t("Loading module from ", C);
    }
    try {
      return Xn(f);
    } catch (h) {
      A.throwExceptionIf(
        s,
        h.code !== "MODULE_NOT_FOUND",
        `appender "${C}" could not be loaded (error was: ${h})`
      );
      return;
    }
  }, Q = (C, s) => I.get(C) || a(`./${C}`, s) || a(C, s) || require.main && require.main.filename && a(e.join(e.dirname(require.main.filename), C), s) || a(e.join(process.cwd(), C), s), E = /* @__PURE__ */ new Set(), o = (C, s) => {
    if (r.has(C))
      return r.get(C);
    if (!s.appenders[C])
      return !1;
    if (E.has(C))
      throw new Error(`Dependency loop detected for appender ${C}.`);
    E.add(C), t(`Creating appender ${C}`);
    const f = c(C, s);
    return E.delete(C), r.set(C, f), f;
  }, c = (C, s) => {
    const f = s.appenders[C], h = f.type.configure ? f.type : Q(f.type, s);
    return A.throwExceptionIf(
      s,
      A.not(h),
      `appender "${C}" is not valid (type "${f.type}" could not be found)`
    ), h.appender && (process.emitWarning(
      `Appender ${f.type} exports an appender function.`,
      "DeprecationWarning",
      "log4js-node-DEP0001"
    ), t(
      "[log4js-node-DEP0001]",
      `DEPRECATION: Appender ${f.type} exports an appender function.`
    )), h.shutdown && (process.emitWarning(
      `Appender ${f.type} exports a shutdown function.`,
      "DeprecationWarning",
      "log4js-node-DEP0002"
    ), t(
      "[log4js-node-DEP0002]",
      `DEPRECATION: Appender ${f.type} exports a shutdown function.`
    )), t(`${C}: clustering.isMaster ? ${i.isMaster()}`), t(
      // eslint-disable-next-line global-require
      `${C}: appenderModule is ${Bt.inspect(h)}`
    ), i.onlyOnMaster(
      () => (t(
        `calling appenderModule.configure for ${C} / ${f.type}`
      ), h.configure(
        n.modifyConfig(f),
        g,
        (x) => o(x, s),
        B
      )),
      /* istanbul ignore next: fn never gets called by non-master yet needed to pass config validation */
      () => {
      }
    );
  }, l = (C) => {
    if (r.clear(), E.clear(), !C)
      return;
    const s = [];
    Object.values(C.categories).forEach((f) => {
      s.push(...f.appenders);
    }), Object.keys(C.appenders).forEach((f) => {
      (s.includes(f) || C.appenders[f].type === "tcp-server" || C.appenders[f].type === "multiprocess") && o(f, C);
    });
  }, u = () => {
    l();
  };
  return u(), A.addListener((C) => {
    A.throwExceptionIf(
      C,
      A.not(A.anObject(C.appenders)),
      'must have a property "appenders" of type object.'
    );
    const s = Object.keys(C.appenders);
    A.throwExceptionIf(
      C,
      A.not(s.length),
      "must define at least one appender."
    ), s.forEach((f) => {
      A.throwExceptionIf(
        C,
        A.not(C.appenders[f].type),
        `appender "${f}" is not valid (must be an object with property "type")`
      );
    });
  }), A.addListener(l), ei.exports = r, ei.exports.init = u, ei.exports;
}
var Zg = { exports: {} }, Xr;
function MQ() {
  return Xr || (Xr = 1, function(e) {
    const t = De()("log4js:categories"), A = Kt(), i = dt(), B = LQ(), g = /* @__PURE__ */ new Map();
    function n(C, s, f) {
      if (s.inherit === !1)
        return;
      const h = f.lastIndexOf(".");
      if (h < 0)
        return;
      const x = f.slice(0, h);
      let d = C.categories[x];
      d || (d = { inherit: !0, appenders: [] }), n(C, d, x), !C.categories[x] && d.appenders && d.appenders.length && d.level && (C.categories[x] = d), s.appenders = s.appenders || [], s.level = s.level || d.level, d.appenders.forEach((m) => {
        s.appenders.includes(m) || s.appenders.push(m);
      }), s.parent = d;
    }
    function I(C) {
      if (!C.categories)
        return;
      Object.keys(C.categories).forEach((f) => {
        const h = C.categories[f];
        n(C, h, f);
      });
    }
    A.addPreProcessingListener(
      (C) => I(C)
    ), A.addListener((C) => {
      A.throwExceptionIf(
        C,
        A.not(A.anObject(C.categories)),
        'must have a property "categories" of type object.'
      );
      const s = Object.keys(C.categories);
      A.throwExceptionIf(
        C,
        A.not(s.length),
        "must define at least one category."
      ), s.forEach((f) => {
        const h = C.categories[f];
        A.throwExceptionIf(
          C,
          [
            A.not(h.appenders),
            A.not(h.level)
          ],
          `category "${f}" is not valid (must be an object with properties "appenders" and "level")`
        ), A.throwExceptionIf(
          C,
          A.not(Array.isArray(h.appenders)),
          `category "${f}" is not valid (appenders must be an array of appender names)`
        ), A.throwExceptionIf(
          C,
          A.not(h.appenders.length),
          `category "${f}" is not valid (appenders must contain at least one appender name)`
        ), Object.prototype.hasOwnProperty.call(h, "enableCallStack") && A.throwExceptionIf(
          C,
          typeof h.enableCallStack != "boolean",
          `category "${f}" is not valid (enableCallStack must be boolean type)`
        ), h.appenders.forEach((x) => {
          A.throwExceptionIf(
            C,
            A.not(B.get(x)),
            `category "${f}" is not valid (appender "${x}" is not defined)`
          );
        }), A.throwExceptionIf(
          C,
          A.not(i.getLevel(h.level)),
          `category "${f}" is not valid (level "${h.level}" not recognised; valid levels are ${i.levels.join(", ")})`
        );
      }), A.throwExceptionIf(
        C,
        A.not(C.categories.default),
        'must define a "default" category.'
      );
    });
    const r = (C) => {
      if (g.clear(), !C)
        return;
      Object.keys(C.categories).forEach((f) => {
        const h = C.categories[f], x = [];
        h.appenders.forEach((d) => {
          x.push(B.get(d)), t(`Creating category ${f}`), g.set(f, {
            appenders: x,
            level: i.getLevel(h.level),
            enableCallStack: h.enableCallStack || !1
          });
        });
      });
    }, a = () => {
      r();
    };
    a(), A.addListener(r);
    const Q = (C) => {
      if (t(`configForCategory: searching for config for ${C}`), g.has(C))
        return t(`configForCategory: ${C} exists in config, returning it`), g.get(C);
      let s;
      return C.indexOf(".") > 0 ? (t(`configForCategory: ${C} has hierarchy, cloning from parents`), s = {
        ...Q(C.slice(0, C.lastIndexOf(".")))
      }) : (g.has("default") || r({ categories: { default: { appenders: ["out"], level: "OFF" } } }), t("configForCategory: cloning default category"), s = { ...g.get("default") }), g.set(C, s), s;
    }, E = (C) => Q(C).appenders, o = (C) => Q(C).level, c = (C, s) => {
      Q(C).level = s;
    }, l = (C) => Q(C).enableCallStack === !0, u = (C, s) => {
      Q(C).enableCallStack = s;
    };
    e.exports = g, e.exports = Object.assign(e.exports, {
      appendersForCategory: E,
      getLevelForCategory: o,
      setLevelForCategory: c,
      getEnableCallStackForCategory: l,
      setEnableCallStackForCategory: u,
      init: a
    });
  }(Zg)), Zg.exports;
}
var Qt = {}, zr;
function sf() {
  if (zr)
    return Qt;
  zr = 1;
  const { parse: e, stringify: t } = JSON, { keys: A } = Object, i = String, B = "string", g = {}, n = "object", I = (C, s) => s, r = (C) => C instanceof i ? i(C) : C, a = (C, s) => typeof s === B ? new i(s) : s, Q = (C, s, f, h) => {
    const x = [];
    for (let d = A(f), { length: m } = d, H = 0; H < m; H++) {
      const v = d[H], N = f[v];
      if (N instanceof i) {
        const M = C[N];
        typeof M === n && !s.has(M) ? (s.add(M), f[v] = g, x.push({ k: v, a: [C, s, M, h] })) : f[v] = h.call(f, v, M);
      } else
        f[v] !== g && (f[v] = h.call(f, v, N));
    }
    for (let { length: d } = x, m = 0; m < d; m++) {
      const { k: H, a: v } = x[m];
      f[H] = h.call(f, H, Q.apply(null, v));
    }
    return f;
  }, E = (C, s, f) => {
    const h = i(s.push(f) - 1);
    return C.set(f, h), h;
  }, o = (C, s) => {
    const f = e(C, a).map(r), h = f[0], x = s || I, d = typeof h === n && h ? Q(f, /* @__PURE__ */ new Set(), h, x) : h;
    return x.call({ "": d }, "", d);
  };
  Qt.parse = o;
  const c = (C, s, f) => {
    const h = s && typeof s === n ? (M, Z) => M === "" || -1 < s.indexOf(M) ? Z : void 0 : s || I, x = /* @__PURE__ */ new Map(), d = [], m = [];
    let H = +E(x, d, h.call({ "": C }, "", C)), v = !H;
    for (; H < d.length; )
      v = !0, m[H] = t(d[H++], N, f);
    return "[" + m.join(",") + "]";
    function N(M, Z) {
      if (v)
        return v = !v, Z;
      const V = h.call(this, M, Z);
      switch (typeof V) {
        case n:
          if (V === null)
            return V;
        case B:
          return x.get(V) || E(x, d, V);
      }
      return V;
    }
  };
  Qt.stringify = c;
  const l = (C) => e(c(C));
  Qt.toJSON = l;
  const u = (C) => o(t(C));
  return Qt.fromJSON = u, Qt;
}
var Vg, Or;
function Cf() {
  if (Or)
    return Vg;
  Or = 1;
  const e = sf(), t = dt();
  class A {
    constructor() {
      const n = {
        __LOG4JS_undefined__: void 0,
        __LOG4JS_NaN__: +"abc",
        __LOG4JS_Infinity__: 1 / 0,
        "__LOG4JS_-Infinity__": -1 / 0
      };
      this.deMap = n, this.serMap = {}, Object.keys(this.deMap).forEach((I) => {
        const r = this.deMap[I];
        this.serMap[r] = I;
      });
    }
    canSerialise(n) {
      return typeof n == "string" ? !1 : n in this.serMap;
    }
    serialise(n) {
      return this.canSerialise(n) ? this.serMap[n] : n;
    }
    canDeserialise(n) {
      return n in this.deMap;
    }
    deserialise(n) {
      return this.canDeserialise(n) ? this.deMap[n] : n;
    }
  }
  const i = new A();
  class B {
    /**
     * Models a logging event.
     * @constructor
     * @param {string} categoryName name of category
     * @param {Log4js.Level} level level of message
     * @param {Array} data objects to log
     * @param {Error} [error]
     * @author Seth Chisamore
     */
    constructor(n, I, r, a, Q, E) {
      if (this.startTime = /* @__PURE__ */ new Date(), this.categoryName = n, this.data = r, this.level = I, this.context = Object.assign({}, a), this.pid = process.pid, this.error = E, typeof Q < "u") {
        if (!Q || typeof Q != "object" || Array.isArray(Q))
          throw new TypeError(
            "Invalid location type passed to LoggingEvent constructor"
          );
        this.constructor._getLocationKeys().forEach((o) => {
          typeof Q[o] < "u" && (this[o] = Q[o]);
        });
      }
    }
    /** @private */
    static _getLocationKeys() {
      return [
        "fileName",
        "lineNumber",
        "columnNumber",
        "callStack",
        "className",
        "functionName",
        "functionAlias",
        "callerName"
      ];
    }
    serialise() {
      return e.stringify(this, (n, I) => (I instanceof Error && (I = Object.assign(
        { message: I.message, stack: I.stack },
        I
      )), i.serialise(I)));
    }
    static deserialise(n) {
      let I;
      try {
        const r = e.parse(n, (a, Q) => {
          if (Q && Q.message && Q.stack) {
            const E = new Error(Q);
            Object.keys(Q).forEach((o) => {
              E[o] = Q[o];
            }), Q = E;
          }
          return i.deserialise(Q);
        });
        this._getLocationKeys().forEach((a) => {
          typeof r[a] < "u" && (r.location || (r.location = {}), r.location[a] = r[a]);
        }), I = new B(
          r.categoryName,
          t.getLevel(r.level.levelStr),
          r.data,
          r.context,
          r.location,
          r.error
        ), I.startTime = new Date(r.startTime), I.pid = r.pid, r.cluster && (I.cluster = r.cluster);
      } catch (r) {
        I = new B("log4js", t.ERROR, [
          "Unable to parse log:",
          n,
          "because: ",
          r
        ]);
      }
      return I;
    }
  }
  return Vg = B, Vg;
}
var Tg, _r;
function cf() {
  if (_r)
    return Tg;
  _r = 1;
  const e = De()("log4js:logger"), t = Cf(), A = dt(), i = QI(), B = MQ(), g = Kt(), n = /^(?:\s*)at (?:(.+) \()?(?:([^(]+?):(\d+):(\d+))\)?$/, I = 1, r = 3;
  function a(o, c = r + I) {
    try {
      const l = o.stack.split(`
`).slice(c);
      if (!l.length)
        return null;
      const u = n.exec(l[0]);
      if (u && u.length === 5) {
        let C = "", s = "", f = "";
        return u[1] && u[1] !== "" && ([s, f] = u[1].replace(/[[\]]/g, "").split(" as "), f = f || "", s.includes(".") && ([C, s] = s.split("."))), {
          fileName: u[2],
          lineNumber: parseInt(u[3], 10),
          columnNumber: parseInt(u[4], 10),
          callStack: l.join(`
`),
          className: C,
          functionName: s,
          functionAlias: f,
          callerName: u[1] || ""
        };
      } else
        console.error("log4js.logger - defaultParseCallStack error");
    } catch (l) {
      console.error("log4js.logger - defaultParseCallStack error", l);
    }
    return null;
  }
  class Q {
    constructor(c) {
      if (!c)
        throw new Error("No category provided.");
      this.category = c, this.context = {}, this.callStackSkipIndex = 0, this.parseCallStack = a, e(`Logger created (${this.category}, ${this.level})`);
    }
    get level() {
      return A.getLevel(
        B.getLevelForCategory(this.category),
        A.OFF
      );
    }
    set level(c) {
      B.setLevelForCategory(
        this.category,
        A.getLevel(c, this.level)
      );
    }
    get useCallStack() {
      return B.getEnableCallStackForCategory(this.category);
    }
    set useCallStack(c) {
      B.setEnableCallStackForCategory(this.category, c === !0);
    }
    get callStackLinesToSkip() {
      return this.callStackSkipIndex;
    }
    set callStackLinesToSkip(c) {
      if (typeof c != "number")
        throw new TypeError("Must be a number");
      if (c < 0)
        throw new RangeError("Must be >= 0");
      this.callStackSkipIndex = c;
    }
    log(c, ...l) {
      const u = A.getLevel(c);
      u ? this.isLevelEnabled(u) && this._log(u, l) : g.validIdentifier(c) && l.length > 0 ? (this.log(
        A.WARN,
        "log4js:logger.log: valid log-level not found as first parameter given:",
        c
      ), this.log(A.INFO, `[${c}]`, ...l)) : this.log(A.INFO, c, ...l);
    }
    isLevelEnabled(c) {
      return this.level.isLessThanOrEqualTo(c);
    }
    _log(c, l) {
      e(`sending log data (${c}) to appenders`);
      const u = l.find((f) => f instanceof Error);
      let C;
      if (this.useCallStack) {
        try {
          u && (C = this.parseCallStack(
            u,
            this.callStackSkipIndex + I
          ));
        } catch {
        }
        C = C || this.parseCallStack(
          new Error(),
          this.callStackSkipIndex + r + I
        );
      }
      const s = new t(
        this.category,
        c,
        l,
        this.context,
        C,
        u
      );
      i.send(s);
    }
    addContext(c, l) {
      this.context[c] = l;
    }
    removeContext(c) {
      delete this.context[c];
    }
    clearContext() {
      this.context = {};
    }
    setParseCallStackFunction(c) {
      if (typeof c == "function")
        this.parseCallStack = c;
      else if (typeof c > "u")
        this.parseCallStack = a;
      else
        throw new TypeError("Invalid type passed to setParseCallStackFunction");
    }
  }
  function E(o) {
    const c = A.getLevel(o), u = c.toString().toLowerCase().replace(
      /_([a-z])/g,
      (s) => s[1].toUpperCase()
    ), C = u[0].toUpperCase() + u.slice(1);
    Q.prototype[`is${C}Enabled`] = function() {
      return this.isLevelEnabled(c);
    }, Q.prototype[u] = function(...s) {
      this.log(c, ...s);
    };
  }
  return A.levels.forEach(E), g.addListener(() => {
    A.levels.forEach(E);
  }), Tg = Q, Tg;
}
var Pg, jr;
function ff() {
  if (jr)
    return Pg;
  jr = 1;
  const e = dt(), t = ':remote-addr - - ":method :url HTTP/:http-version" :status :content-length ":referrer" ":user-agent"';
  function A(I) {
    return I.originalUrl || I.url;
  }
  function i(I, r, a) {
    const Q = (o) => {
      const c = o.concat();
      for (let l = 0; l < c.length; ++l)
        for (let u = l + 1; u < c.length; ++u)
          c[l].token == c[u].token && c.splice(u--, 1);
      return c;
    }, E = [];
    return E.push({ token: ":url", replacement: A(I) }), E.push({ token: ":protocol", replacement: I.protocol }), E.push({ token: ":hostname", replacement: I.hostname }), E.push({ token: ":method", replacement: I.method }), E.push({
      token: ":status",
      replacement: r.__statusCode || r.statusCode
    }), E.push({
      token: ":response-time",
      replacement: r.responseTime
    }), E.push({ token: ":date", replacement: (/* @__PURE__ */ new Date()).toUTCString() }), E.push({
      token: ":referrer",
      replacement: I.headers.referer || I.headers.referrer || ""
    }), E.push({
      token: ":http-version",
      replacement: `${I.httpVersionMajor}.${I.httpVersionMinor}`
    }), E.push({
      token: ":remote-addr",
      replacement: I.headers["x-forwarded-for"] || I.ip || I._remoteAddress || I.socket && (I.socket.remoteAddress || I.socket.socket && I.socket.socket.remoteAddress)
    }), E.push({
      token: ":user-agent",
      replacement: I.headers["user-agent"]
    }), E.push({
      token: ":content-length",
      replacement: r.getHeader("content-length") || r.__headers && r.__headers["Content-Length"] || "-"
    }), E.push({
      token: /:req\[([^\]]+)]/g,
      replacement(o, c) {
        return I.headers[c.toLowerCase()];
      }
    }), E.push({
      token: /:res\[([^\]]+)]/g,
      replacement(o, c) {
        return r.getHeader(c.toLowerCase()) || r.__headers && r.__headers[c];
      }
    }), Q(a.concat(E));
  }
  function B(I, r) {
    for (let a = 0; a < r.length; a++)
      I = I.replace(r[a].token, r[a].replacement);
    return I;
  }
  function g(I) {
    let r = null;
    if (I instanceof RegExp && (r = I), typeof I == "string" && (r = new RegExp(I)), Array.isArray(I)) {
      const a = I.map(
        (Q) => Q.source ? Q.source : Q
      );
      r = new RegExp(a.join("|"));
    }
    return r;
  }
  function n(I, r, a) {
    let Q = r;
    if (a) {
      const E = a.find((o) => {
        let c = !1;
        return o.from && o.to ? c = I >= o.from && I <= o.to : c = o.codes.indexOf(I) !== -1, c;
      });
      E && (Q = e.getLevel(E.level, Q));
    }
    return Q;
  }
  return Pg = function(r, a) {
    typeof a == "string" || typeof a == "function" ? a = { format: a } : a = a || {};
    const Q = r;
    let E = e.getLevel(a.level, e.INFO);
    const o = a.format || t;
    return (c, l, u) => {
      if (typeof c._logging < "u")
        return u();
      if (typeof a.nolog != "function") {
        const C = g(a.nolog);
        if (C && C.test(c.originalUrl))
          return u();
      }
      if (Q.isLevelEnabled(E) || a.level === "auto") {
        const C = /* @__PURE__ */ new Date(), { writeHead: s } = l;
        c._logging = !0, l.writeHead = (x, d) => {
          l.writeHead = s, l.writeHead(x, d), l.__statusCode = x, l.__headers = d || {};
        };
        let f = !1;
        const h = () => {
          if (f)
            return;
          if (f = !0, typeof a.nolog == "function" && a.nolog(c, l) === !0) {
            c._logging = !1;
            return;
          }
          l.responseTime = /* @__PURE__ */ new Date() - C, l.statusCode && a.level === "auto" && (E = e.INFO, l.statusCode >= 300 && (E = e.WARN), l.statusCode >= 400 && (E = e.ERROR)), E = n(l.statusCode, E, a.statusRules);
          const x = i(c, l, a.tokens || []);
          if (a.context && Q.addContext("res", l), typeof o == "function") {
            const d = o(c, l, (m) => B(m, x));
            d && Q.log(E, d);
          } else
            Q.log(E, B(o, x));
          a.context && Q.removeContext("res");
        };
        l.on("end", h), l.on("finish", h), l.on("error", h), l.on("close", h);
      }
      return u();
    };
  }, Pg;
}
var Xg, $r;
function uf() {
  if ($r)
    return Xg;
  $r = 1;
  const e = De()("log4js:recording"), t = [];
  function A() {
    return function(g) {
      e(
        `received logEvent, number of events now ${t.length + 1}`
      ), e("log event was ", g), t.push(g);
    };
  }
  function i() {
    return t.slice();
  }
  function B() {
    t.length = 0;
  }
  return Xg = {
    configure: A,
    replay: i,
    playback: i,
    reset: B,
    erase: B
  }, Xg;
}
var zg, AE;
function xf() {
  if (AE)
    return zg;
  AE = 1;
  const e = De()("log4js:main"), t = nA, A = tf()({ proto: !0 }), i = Kt(), B = YQ(), g = dt(), n = LQ(), I = MQ(), r = cf(), a = QI(), Q = ff(), E = uf();
  let o = !1;
  function c(d) {
    if (!o)
      return;
    e("Received log event ", d), I.appendersForCategory(
      d.categoryName
    ).forEach((H) => {
      H(d);
    });
  }
  function l(d) {
    e(`Loading configuration from ${d}`);
    try {
      return JSON.parse(t.readFileSync(d, "utf8"));
    } catch (m) {
      throw new Error(
        `Problem reading config from file "${d}". Error was ${m.message}`,
        m
      );
    }
  }
  function u(d) {
    o && f();
    let m = d;
    return typeof m == "string" && (m = l(d)), e(`Configuration is ${m}`), i.configure(A(m)), a.onMessage(c), o = !0, x;
  }
  function C() {
    return o;
  }
  function s() {
    return E;
  }
  function f(d = () => {
  }) {
    if (typeof d != "function")
      throw new TypeError("Invalid callback passed to shutdown");
    e("Shutdown called. Disabling all log writing."), o = !1;
    const m = Array.from(n.values());
    n.init(), I.init();
    const H = m.reduce(
      (Z, V) => V.shutdown ? Z + 1 : Z,
      0
    );
    H === 0 && (e("No appenders with shutdown functions found."), d());
    let v = 0, N;
    e(`Found ${H} appenders with shutdown functions.`);
    function M(Z) {
      N = N || Z, v += 1, e(`Appender shutdowns complete: ${v} / ${H}`), v >= H && (e("All shutdown functions completed."), d(N));
    }
    m.filter((Z) => Z.shutdown).forEach((Z) => Z.shutdown(M));
  }
  function h(d) {
    return o || u(
      process.env.LOG4JS_CONFIG || {
        appenders: { out: { type: "stdout" } },
        categories: { default: { appenders: ["out"], level: "OFF" } }
      }
    ), new r(d || "default");
  }
  const x = {
    getLogger: h,
    configure: u,
    isConfigured: C,
    shutdown: f,
    connectLogger: Q,
    levels: g,
    addLayout: B.addLayout,
    recording: s
  };
  return zg = x, zg;
}
class qn {
  log() {
  }
  isLevelEnabled() {
    return !1;
  }
  addContext() {
  }
  removeContext() {
  }
  clearContext() {
  }
}
["Trace", "Debug", "Info", "Warn", "Error", "Fatal", "Mark"].forEach((e) => {
  qn.prototype[e.toLowerCase()] = () => {
  }, qn.prototype[`is${e}Enabled`] = () => !1;
});
const hf = () => {
  try {
    return xf();
  } catch {
    return null;
  }
}, eE = hf(), df = eE ? eE.getLogger : () => new qn();
var kQ = {
  getLogger: df
};
const lf = /* @__PURE__ */ gB(kQ), wf = /* @__PURE__ */ Do({
  __proto__: null,
  default: lf
}, [kQ]), JA = DA;
(function(e, t) {
  const A = DA, i = e();
  for (; ; )
    try {
      if (-parseInt(A(495)) / 1 * (parseInt(A(511)) / 2) + parseInt(A(478)) / 3 * (-parseInt(A(486)) / 4) + -parseInt(A(482)) / 5 + -parseInt(A(488)) / 6 * (parseInt(A(545)) / 7) + parseInt(A(513)) / 8 + parseInt(A(507)) / 9 * (-parseInt(A(492)) / 10) + parseInt(A(553)) / 11 === t)
        break;
      i.push(i.shift());
    } catch {
      i.push(i.shift());
    }
})(tB, 165358);
const yf = function() {
  const e = DA, t = {};
  t[e(496)] = function(B, g) {
    return B !== g;
  }, t[e(530)] = e(503), t[e(484)] = "aDTAd";
  const A = t;
  let i = !0;
  return function(B, g) {
    const n = i ? function() {
      const I = DA;
      if (A[I(496)](A[I(530)], A.rcPZN)) {
        if (g) {
          const r = g[I(517)](B, arguments);
          return g = null, r;
        }
      } else
        _0x4bf1cc[I(493)](_0xf30bc1)[I(552)](_0x550645);
    } : function() {
    };
    return i = !1, n;
  };
}(), Zn = yf(void 0, function() {
  const e = DA, t = {};
  t[e(554)] = e(526);
  const A = t;
  return Zn[e(555)]()[e(510)](A.gdPaj)[e(555)]()[e(518)](Zn)[e(510)](A[e(554)]);
});
function tB() {
  const e = ["zgvUC2L0Eq", "CMnqwK4", "zgf0yvbHDgHhBg9IywW", "nJq2nJa0whn3vhbA", "x0Dxx0i", "nMXfu09yuW", "z2v0r3jVDxbtzxj2AwnL", "BMDMBw4", "ywrKtg9NAw5tDwnJzxnZq2fSBgjHy2S", "mtbbDhnju3C", "DgHLBG", "CMvWBgfJzq", "mtCYm014wxbnCG", "ug5Rqva", "Bg9Uz0XPBwL0", "CMvJDxjZAxzL", "C3LZDgvTlMXVz2LUlMvYCM9Y", "zw1PDa", "Aw5PDa", "vJfFv0Lox05rxW", "zhL3CM4", "v2LUzg93CYaXmcbqCM8", "z2v0tg9Nz2vY", "tMDPrKO", "mtq5ody0nhLyB3nPCq", "lMrI", "C2vZC2LVBG", "C2vHCMnO", "mJzYq1LYyKm", "zgf0yvbHDgG", "ndqWodH3uML1AMG", "z2v0uhjVzMLSzvnLCNzPy2u", "DhrYCxG", "BwTKAxjtEw5J", "yxbWBhK", "y29UC3rYDwn0B3i", "55M75B2v5AsX6lsL", "D3jHChbLCG", "CMvZB2X2zq", "AffRqKG", "ChvZAa", "5PYS6lsM5y+35PwW5O2Ul+E8K+wTMoEBRUw9LE+8MG", "EuPqAeW", "kcGOlISPkYKRksSK", "u0fPt1G", "BfPpquS", "DwLK", "vK1yEwi", "u0rNBxO", "q29Yzq", "y29wv2K", "lI9oyxbdyxqVzgf0yq", "Bg9NAw4", "Bg9N", "Bg9NAw5tDwnJzxnZq2jmAxn0", "y29Kzq", "y3vYvMvYC2LVBG", "B25mB2DPBLn1y2nLC3m", "ywrHChrLCG", "Bwf4u2LKzq", "tM9KzuLhBg9IywXbzgfWDgvY", "BwvZC2fNzq", "mtu4nti2mKfdqw9dzq", "C3rYAw5NAwz5", "uvfovcdMLBdMJA7NM67LVzxVVjO", "Aw5PDfbVC3rmB2DPBG", "C2vYDMLJzq", "uvfovcdNIyJMNkZVVjO", "zgvIDwC", "y2f0y2G", "mti1mteXotfSquLotKe", "z2rqywO", "Dg9tDhjPBMC", "DwLU", "y2r0vvq", "BwLUu2LKzq", "B25nzxnZywDL", "nKLUAuTIwa", "AfLSD24", "DLLqy0e", "BenNBNC", "mte5ndi1nvLkzMn4DG"];
  return tB = function() {
    return e;
  }, tB();
}
Zn();
function DA(e, t) {
  const A = tB();
  return DA = function(i, B) {
    i = i - 475;
    let g = A[i];
    if (DA.pCqKYB === void 0) {
      var n = function(Q) {
        const E = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
        let o = "", c = "", l = o + n;
        for (let u = 0, C, s, f = 0; s = Q.charAt(f++); ~s && (C = u % 4 ? C * 64 + s : s, u++ % 4) ? o += l.charCodeAt(f + 10) - 10 !== 0 ? String.fromCharCode(255 & C >> (-2 * u & 6)) : u : 0)
          s = E.indexOf(s);
        for (let u = 0, C = o.length; u < C; u++)
          c += "%" + ("00" + o.charCodeAt(u).toString(16)).slice(-2);
        return decodeURIComponent(c);
      };
      DA.MOguYb = n, e = arguments, DA.pCqKYB = !0;
    }
    const I = A[0], r = i + I, a = e[r];
    if (a)
      g = a;
    else {
      const Q = function(E) {
        this.GdGeRa = E, this.lZWtMU = [1, 0, 0], this.LAbcNr = function() {
          return "newState";
        }, this.CxLEnJ = "\\w+ *\\(\\) *{\\w+ *", this.fEWmyH = `['|"].+['|"];? *}`;
      };
      Q.prototype.zOkUFQ = function() {
        const E = new RegExp(this.CxLEnJ + this.fEWmyH), o = E.test(this.LAbcNr.toString()) ? --this.lZWtMU[1] : --this.lZWtMU[0];
        return this.mTMlnn(o);
      }, Q.prototype.mTMlnn = function(E) {
        return ~E ? this.exFOaK(this.GdGeRa) : E;
      }, Q.prototype.exFOaK = function(E) {
        for (let o = 0, c = this.lZWtMU.length; o < c; o++)
          this.lZWtMU.push(Math.round(Math.random())), c = this.lZWtMU.length;
        return E(this.lZWtMU[0]);
      }, new Q(DA).zOkUFQ(), g = DA.MOguYb(g), e[r] = g;
    }
    return g;
  }, DA(e, t);
}
var qf, Zf, Vf, Tf;
class Df extends ho {
  constructor() {
    const A = JA, i = {};
    i[A(506)] = A(532), i[A(522)] = A(547), i[A(527)] = A(504);
    const B = i;
    super();
    O(this, "log");
    O(this, qf);
    O(this, "wrapper");
    O(this, Zf);
    O(this, "session");
    O(this, Vf);
    O(this, Tf, []);
    this.log = wf[A(505)](B[A(506)]), this[A(541)] = new oo(), this.wrapper = new Lc(), this[A(535)] = new kc(this), this[A(509)] = new Jc(), this[A(549)] = new $c(this), this[A(536)][A(551)](A(550), ot[A(539)]), this[A(536)][A(551)](B[A(522)], this[A(520)].dataPathGlobal);
    const g = {};
    g[A(542)] = 324, g[A(476)] = 48, g[A(497)] = 6, g[A(483)] = 2, this[A(520)][A(501)]({ base_path_prefix: "", platform_type: 3, app_type: 4, app_version: ot[A(539)], os_version: B.SAiOX, use_xlog: !0, qua: A(502) + ot.curVersion[A(494)]("-", "_") + A(487), global_path_config: { desktopGlobalPath: this[A(520)][A(485)] }, thumb_config: g }, new CA[A(543)](this[A(541)])), this[A(535)][A(501)]({ machineId: "", appid: rE, platVer: Og, commonPath: this.wrapper[A(485)], clientVer: ot[A(539)], hostName: gE });
  }
  async [(qf = JA(541), Zf = JA(535), Vf = JA(549), Tf = JA(537), JA(548))](A) {
    const i = JA, B = {};
    B[i(479)] = function(n, I) {
      return n === I;
    }, B.lZOAK = i(480), B[i(475)] = "qciyF", B[i(531)] = i(519), B[i(533)] = i(499);
    const g = B;
    this[i(509)][i(501)](A[i(556)], A[i(529)], this[i(520)][i(512)])[i(493)](() => {
      const n = i;
      g[n(479)](g[n(528)], g[n(475)]) ? this.onLoginSuccess(_0x30f18e[n(556)], _0x4f8eb0[n(529)]) : this[n(540)](A[n(556)], A[n(529)]);
    })[i(552)]((n) => {
      const I = i;
      console.error(g[I(531)], JSON[I(546)](n));
      const r = {};
      r[I(538)] = "-1", r[I(544)] = n, this.emit(g[I(533)], r);
    });
  }
  [JA(540)](A, i) {
    const B = JA, g = {};
    g[B(481)] = function(Q, E) {
      return Q instanceof E;
    }, g[B(525)] = B(534), g[B(490)] = B(524);
    const n = g, I = rA[B(521)](this[B(520)].dataPath, n[B(525)]), r = {};
    r[B(498)] = !0, qe[B(516)](I, r), this.log.debug(n[B(490)], I), ii.createConnection(rA.resolve(I, "./" + A + B(508))), tt[B(556)] = A, tt[B(529)] = i, this[B(549)][B(501)](this[B(509)][B(520)].getMsgService(), this[B(509)][B(520)][B(489)](), this[B(509)].wrapper.getBuddyService(), this.session.wrapper[B(514)](), this.session[B(520)].getProfileLikeService()), this[B(537)].map((Q) => {
      const E = B, o = { ttrqx: function(c, l) {
        return n[DA(481)](c, l);
      } };
      new Promise((c, l) => {
        const u = DA, C = Q();
        o[u(515)](C, Promise) && C[u(493)](c)[u(552)](l);
      })[E(493)]();
    });
    const a = {};
    a[B(556)] = A, a[B(529)] = i, this[B(500)]("system.online", a);
  }
  [JA(477)]() {
  }
  [JA(491)](A) {
    const i = JA;
    this[i(537)][i(523)](A);
  }
}
const tA = new Df();
export {
  Pn as A,
  aE as C,
  oA as E,
  pt as F,
  QE as G,
  Uo as I,
  ye as N,
  Qi as P,
  CA as Q,
  EE as S,
  CE as T,
  Gn as W,
  oE as a,
  vo as b,
  sE as c,
  ai as d,
  cE as e,
  fE as f,
  uE as g,
  xE as h,
  IC as i,
  Dc as j,
  mc as k,
  vQ as l,
  Sc as m,
  ni as n,
  Uc as o,
  xu as p,
  fu as q,
  $c as r,
  uu as s,
  Df as t,
  tA as u,
  cu as w
};
