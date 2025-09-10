(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function getHash() {
  if (location.hash) {
    return location.hash.replace("#", "");
  }
}
let slideUp = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = `${target.offsetHeight}px`;
    target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    window.setTimeout(() => {
      target.hidden = !showmore ? true : false;
      !showmore ? target.style.removeProperty("height") : null;
      target.style.removeProperty("padding-top");
      target.style.removeProperty("padding-bottom");
      target.style.removeProperty("margin-top");
      target.style.removeProperty("margin-bottom");
      !showmore ? target.style.removeProperty("overflow") : null;
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(new CustomEvent("slideUpDone", {
        detail: {
          target
        }
      }));
    }, duration);
  }
};
let slideDown = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.hidden = target.hidden ? false : null;
    showmore ? target.style.removeProperty("height") : null;
    let height = target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    target.offsetHeight;
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = height + "px";
    target.style.removeProperty("padding-top");
    target.style.removeProperty("padding-bottom");
    target.style.removeProperty("margin-top");
    target.style.removeProperty("margin-bottom");
    window.setTimeout(() => {
      target.style.removeProperty("height");
      target.style.removeProperty("overflow");
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(new CustomEvent("slideDownDone", {
        detail: {
          target
        }
      }));
    }, duration);
  }
};
let slideToggle = (target, duration = 500) => {
  if (target.hidden) {
    return slideDown(target, duration);
  } else {
    return slideUp(target, duration);
  }
};
let bodyLockStatus = true;
let bodyLockToggle = (delay = 500) => {
  if (document.documentElement.hasAttribute("data-fls-scrolllock")) {
    bodyUnlock(delay);
  } else {
    bodyLock(delay);
  }
};
let bodyUnlock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    setTimeout(() => {
      lockPaddingElements.forEach((lockPaddingElement) => {
        lockPaddingElement.style.paddingRight = "";
      });
      document.body.style.paddingRight = "";
      document.documentElement.removeAttribute("data-fls-scrolllock");
    }, delay);
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
let bodyLock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    const lockPaddingValue = window.innerWidth - document.body.offsetWidth + "px";
    lockPaddingElements.forEach((lockPaddingElement) => {
      lockPaddingElement.style.paddingRight = lockPaddingValue;
    });
    document.body.style.paddingRight = lockPaddingValue;
    document.documentElement.setAttribute("data-fls-scrolllock", "");
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
function uniqArray(array) {
  return array.filter((item, index, self) => self.indexOf(item) === index);
}
function dataMediaQueries(array, dataSetValue) {
  const media = Array.from(array).filter((item) => item.dataset[dataSetValue]).map((item) => {
    const [value, type = "max"] = item.dataset[dataSetValue].split(",");
    return { value, type, item };
  });
  if (media.length === 0) return [];
  const breakpointsArray = media.map(({ value, type }) => `(${type}-width: ${value}px),${value},${type}`);
  const uniqueQueries = [...new Set(breakpointsArray)];
  return uniqueQueries.map((query) => {
    const [mediaQuery, mediaBreakpoint, mediaType] = query.split(",");
    const matchMedia2 = window.matchMedia(mediaQuery);
    const itemsArray = media.filter((item) => item.value === mediaBreakpoint && item.type === mediaType);
    return { itemsArray, matchMedia: matchMedia2 };
  });
}
const gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
  const targetBlockElement = document.querySelector(targetBlock);
  if (targetBlockElement) {
    let headerItem = "";
    let headerItemHeight = 0;
    if (noHeader) {
      headerItem = "header.header";
      const headerElement = document.querySelector(headerItem);
      if (!headerElement.classList.contains("--header-scroll")) {
        headerElement.style.cssText = `transition-duration: 0s;`;
        headerElement.classList.add("--header-scroll");
        headerItemHeight = headerElement.offsetHeight;
        headerElement.classList.remove("--header-scroll");
        setTimeout(() => {
          headerElement.style.cssText = ``;
        }, 0);
      } else {
        headerItemHeight = headerElement.offsetHeight;
      }
    }
    if (document.documentElement.hasAttribute("data-fls-menu-open")) {
      bodyUnlock();
      document.documentElement.removeAttribute("data-fls-menu-open");
    }
    let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
    targetBlockElementPosition = headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition;
    targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition;
    window.scrollTo({
      top: targetBlockElementPosition,
      behavior: "smooth"
    });
  }
};
function menuInit() {
  document.addEventListener("click", function(e) {
    if (bodyLockStatus && e.target.closest("[data-fls-menu]")) {
      bodyLockToggle();
      document.documentElement.toggleAttribute("data-fls-menu-open");
      return;
    }
    if (document.documentElement.hasAttribute("data-fls-menu-open")) {
      const aside = document.querySelector(".aside-wrapper");
      const clickInsideAside = aside && e.target.closest(".aside-wrapper");
      const clickOnToggle = e.target.closest("[data-fls-menu]");
      if (!clickInsideAside && !clickOnToggle) {
        bodyUnlock();
        document.documentElement.removeAttribute("data-fls-menu-open");
      }
    }
  });
}
document.querySelector("[data-fls-menu]") ? window.addEventListener("load", menuInit) : null;
class ScrollWatcher {
  constructor(props) {
    let defaultConfig = {
      logging: true
    };
    this.config = Object.assign(defaultConfig, props);
    this.observer;
    !document.documentElement.hasAttribute("data-fls-watch") ? this.scrollWatcherRun() : null;
  }
  // Оновлюємо конструктор
  scrollWatcherUpdate() {
    this.scrollWatcherRun();
  }
  // Запускаємо конструктор
  scrollWatcherRun() {
    document.documentElement.setAttribute("data-fls-watch", "");
    this.scrollWatcherConstructor(document.querySelectorAll("[data-fls-watcher]"));
  }
  // Конструктор спостерігачів
  scrollWatcherConstructor(items) {
    if (items.length) {
      let uniqParams = uniqArray(Array.from(items).map(function(item) {
        if (item.dataset.flsWatcher === "navigator" && !item.dataset.flsWatcherThreshold) {
          let valueOfThreshold;
          if (item.clientHeight > 2) {
            valueOfThreshold = window.innerHeight / 2 / (item.clientHeight - 1);
            if (valueOfThreshold > 1) {
              valueOfThreshold = 1;
            }
          } else {
            valueOfThreshold = 1;
          }
          item.setAttribute(
            "data-fls-watcher-threshold",
            valueOfThreshold.toFixed(2)
          );
        }
        return `${item.dataset.flsWatcherRoot ? item.dataset.flsWatcherRoot : null}|${item.dataset.flsWatcherMargin ? item.dataset.flsWatcherMargin : "0px"}|${item.dataset.flsWatcherThreshold ? item.dataset.flsWatcherThreshold : 0}`;
      }));
      uniqParams.forEach((uniqParam) => {
        let uniqParamArray = uniqParam.split("|");
        let paramsWatch = {
          root: uniqParamArray[0],
          margin: uniqParamArray[1],
          threshold: uniqParamArray[2]
        };
        let groupItems = Array.from(items).filter(function(item) {
          let watchRoot = item.dataset.flsWatcherRoot ? item.dataset.flsWatcherRoot : null;
          let watchMargin = item.dataset.flsWatcherMargin ? item.dataset.flsWatcherMargin : "0px";
          let watchThreshold = item.dataset.flsWatcherThreshold ? item.dataset.flsWatcherThreshold : 0;
          if (String(watchRoot) === paramsWatch.root && String(watchMargin) === paramsWatch.margin && String(watchThreshold) === paramsWatch.threshold) {
            return item;
          }
        });
        let configWatcher = this.getScrollWatcherConfig(paramsWatch);
        this.scrollWatcherInit(groupItems, configWatcher);
      });
    }
  }
  // Функція створення налаштувань
  getScrollWatcherConfig(paramsWatch) {
    let configWatcher = {};
    if (document.querySelector(paramsWatch.root)) {
      configWatcher.root = document.querySelector(paramsWatch.root);
    } else if (paramsWatch.root !== "null") ;
    configWatcher.rootMargin = paramsWatch.margin;
    if (paramsWatch.margin.indexOf("px") < 0 && paramsWatch.margin.indexOf("%") < 0) {
      return;
    }
    if (paramsWatch.threshold === "prx") {
      paramsWatch.threshold = [];
      for (let i = 0; i <= 1; i += 5e-3) {
        paramsWatch.threshold.push(i);
      }
    } else {
      paramsWatch.threshold = paramsWatch.threshold.split(",");
    }
    configWatcher.threshold = paramsWatch.threshold;
    return configWatcher;
  }
  // Функція створення нового спостерігача зі своїми налаштуваннями
  scrollWatcherCreate(configWatcher) {
    this.observer = new IntersectionObserver((entries2, observer) => {
      entries2.forEach((entry) => {
        this.scrollWatcherCallback(entry, observer);
      });
    }, configWatcher);
  }
  // Функція ініціалізації спостерігача зі своїми налаштуваннями
  scrollWatcherInit(items, configWatcher) {
    this.scrollWatcherCreate(configWatcher);
    items.forEach((item) => this.observer.observe(item));
  }
  // Функція обробки базових дій точок спрацьовування
  scrollWatcherIntersecting(entry, targetElement) {
    if (entry.isIntersecting) {
      !targetElement.classList.contains("--watcher-view") ? targetElement.classList.add("--watcher-view") : null;
    } else {
      targetElement.classList.contains("--watcher-view") ? targetElement.classList.remove("--watcher-view") : null;
    }
  }
  // Функція відключення стеження за об'єктом
  scrollWatcherOff(targetElement, observer) {
    observer.unobserve(targetElement);
  }
  // Функція обробки спостереження
  scrollWatcherCallback(entry, observer) {
    const targetElement = entry.target;
    this.scrollWatcherIntersecting(entry, targetElement);
    targetElement.hasAttribute("data-fls-watcher-once") && entry.isIntersecting ? this.scrollWatcherOff(targetElement, observer) : null;
    document.dispatchEvent(new CustomEvent("watcherCallback", {
      detail: {
        entry
      }
    }));
  }
}
document.querySelector("[data-fls-watcher]") ? window.addEventListener("load", () => new ScrollWatcher({})) : null;
var top = "top";
var bottom = "bottom";
var right = "right";
var left = "left";
var auto = "auto";
var basePlacements = [top, bottom, right, left];
var start = "start";
var end = "end";
var clippingParents = "clippingParents";
var viewport = "viewport";
var popper = "popper";
var reference = "reference";
var variationPlacements = /* @__PURE__ */ basePlacements.reduce(function(acc, placement) {
  return acc.concat([placement + "-" + start, placement + "-" + end]);
}, []);
var placements = /* @__PURE__ */ [].concat(basePlacements, [auto]).reduce(function(acc, placement) {
  return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
}, []);
var beforeRead = "beforeRead";
var read = "read";
var afterRead = "afterRead";
var beforeMain = "beforeMain";
var main = "main";
var afterMain = "afterMain";
var beforeWrite = "beforeWrite";
var write = "write";
var afterWrite = "afterWrite";
var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];
function getNodeName(element2) {
  return element2 ? (element2.nodeName || "").toLowerCase() : null;
}
function getWindow(node) {
  if (node == null) {
    return window;
  }
  if (node.toString() !== "[object Window]") {
    var ownerDocument = node.ownerDocument;
    return ownerDocument ? ownerDocument.defaultView || window : window;
  }
  return node;
}
function isElement$1(node) {
  var OwnElement = getWindow(node).Element;
  return node instanceof OwnElement || node instanceof Element;
}
function isHTMLElement(node) {
  var OwnElement = getWindow(node).HTMLElement;
  return node instanceof OwnElement || node instanceof HTMLElement;
}
function isShadowRoot(node) {
  if (typeof ShadowRoot === "undefined") {
    return false;
  }
  var OwnElement = getWindow(node).ShadowRoot;
  return node instanceof OwnElement || node instanceof ShadowRoot;
}
function applyStyles(_ref) {
  var state = _ref.state;
  Object.keys(state.elements).forEach(function(name) {
    var style = state.styles[name] || {};
    var attributes = state.attributes[name] || {};
    var element2 = state.elements[name];
    if (!isHTMLElement(element2) || !getNodeName(element2)) {
      return;
    }
    Object.assign(element2.style, style);
    Object.keys(attributes).forEach(function(name2) {
      var value = attributes[name2];
      if (value === false) {
        element2.removeAttribute(name2);
      } else {
        element2.setAttribute(name2, value === true ? "" : value);
      }
    });
  });
}
function effect$2(_ref2) {
  var state = _ref2.state;
  var initialStyles = {
    popper: {
      position: state.options.strategy,
      left: "0",
      top: "0",
      margin: "0"
    },
    arrow: {
      position: "absolute"
    },
    reference: {}
  };
  Object.assign(state.elements.popper.style, initialStyles.popper);
  state.styles = initialStyles;
  if (state.elements.arrow) {
    Object.assign(state.elements.arrow.style, initialStyles.arrow);
  }
  return function() {
    Object.keys(state.elements).forEach(function(name) {
      var element2 = state.elements[name];
      var attributes = state.attributes[name] || {};
      var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]);
      var style = styleProperties.reduce(function(style2, property) {
        style2[property] = "";
        return style2;
      }, {});
      if (!isHTMLElement(element2) || !getNodeName(element2)) {
        return;
      }
      Object.assign(element2.style, style);
      Object.keys(attributes).forEach(function(attribute) {
        element2.removeAttribute(attribute);
      });
    });
  };
}
const applyStyles$1 = {
  name: "applyStyles",
  enabled: true,
  phase: "write",
  fn: applyStyles,
  effect: effect$2,
  requires: ["computeStyles"]
};
function getBasePlacement$1(placement) {
  return placement.split("-")[0];
}
var max = Math.max;
var min = Math.min;
var round = Math.round;
function getUAString() {
  var uaData = navigator.userAgentData;
  if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
    return uaData.brands.map(function(item) {
      return item.brand + "/" + item.version;
    }).join(" ");
  }
  return navigator.userAgent;
}
function isLayoutViewport() {
  return !/^((?!chrome|android).)*safari/i.test(getUAString());
}
function getBoundingClientRect(element2, includeScale, isFixedStrategy) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  var clientRect = element2.getBoundingClientRect();
  var scaleX = 1;
  var scaleY = 1;
  if (includeScale && isHTMLElement(element2)) {
    scaleX = element2.offsetWidth > 0 ? round(clientRect.width) / element2.offsetWidth || 1 : 1;
    scaleY = element2.offsetHeight > 0 ? round(clientRect.height) / element2.offsetHeight || 1 : 1;
  }
  var _ref = isElement$1(element2) ? getWindow(element2) : window, visualViewport = _ref.visualViewport;
  var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
  var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
  var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
  var width = clientRect.width / scaleX;
  var height = clientRect.height / scaleY;
  return {
    width,
    height,
    top: y,
    right: x + width,
    bottom: y + height,
    left: x,
    x,
    y
  };
}
function getLayoutRect(element2) {
  var clientRect = getBoundingClientRect(element2);
  var width = element2.offsetWidth;
  var height = element2.offsetHeight;
  if (Math.abs(clientRect.width - width) <= 1) {
    width = clientRect.width;
  }
  if (Math.abs(clientRect.height - height) <= 1) {
    height = clientRect.height;
  }
  return {
    x: element2.offsetLeft,
    y: element2.offsetTop,
    width,
    height
  };
}
function contains(parent, child) {
  var rootNode = child.getRootNode && child.getRootNode();
  if (parent.contains(child)) {
    return true;
  } else if (rootNode && isShadowRoot(rootNode)) {
    var next = child;
    do {
      if (next && parent.isSameNode(next)) {
        return true;
      }
      next = next.parentNode || next.host;
    } while (next);
  }
  return false;
}
function getComputedStyle$1(element2) {
  return getWindow(element2).getComputedStyle(element2);
}
function isTableElement(element2) {
  return ["table", "td", "th"].indexOf(getNodeName(element2)) >= 0;
}
function getDocumentElement(element2) {
  return ((isElement$1(element2) ? element2.ownerDocument : (
    // $FlowFixMe[prop-missing]
    element2.document
  )) || window.document).documentElement;
}
function getParentNode(element2) {
  if (getNodeName(element2) === "html") {
    return element2;
  }
  return (
    // this is a quicker (but less type safe) way to save quite some bytes from the bundle
    // $FlowFixMe[incompatible-return]
    // $FlowFixMe[prop-missing]
    element2.assignedSlot || // step into the shadow DOM of the parent of a slotted node
    element2.parentNode || // DOM Element detected
    (isShadowRoot(element2) ? element2.host : null) || // ShadowRoot detected
    // $FlowFixMe[incompatible-call]: HTMLElement is a Node
    getDocumentElement(element2)
  );
}
function getTrueOffsetParent(element2) {
  if (!isHTMLElement(element2) || // https://github.com/popperjs/popper-core/issues/837
  getComputedStyle$1(element2).position === "fixed") {
    return null;
  }
  return element2.offsetParent;
}
function getContainingBlock(element2) {
  var isFirefox = /firefox/i.test(getUAString());
  var isIE = /Trident/i.test(getUAString());
  if (isIE && isHTMLElement(element2)) {
    var elementCss = getComputedStyle$1(element2);
    if (elementCss.position === "fixed") {
      return null;
    }
  }
  var currentNode = getParentNode(element2);
  if (isShadowRoot(currentNode)) {
    currentNode = currentNode.host;
  }
  while (isHTMLElement(currentNode) && ["html", "body"].indexOf(getNodeName(currentNode)) < 0) {
    var css = getComputedStyle$1(currentNode);
    if (css.transform !== "none" || css.perspective !== "none" || css.contain === "paint" || ["transform", "perspective"].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === "filter" || isFirefox && css.filter && css.filter !== "none") {
      return currentNode;
    } else {
      currentNode = currentNode.parentNode;
    }
  }
  return null;
}
function getOffsetParent(element2) {
  var window2 = getWindow(element2);
  var offsetParent = getTrueOffsetParent(element2);
  while (offsetParent && isTableElement(offsetParent) && getComputedStyle$1(offsetParent).position === "static") {
    offsetParent = getTrueOffsetParent(offsetParent);
  }
  if (offsetParent && (getNodeName(offsetParent) === "html" || getNodeName(offsetParent) === "body" && getComputedStyle$1(offsetParent).position === "static")) {
    return window2;
  }
  return offsetParent || getContainingBlock(element2) || window2;
}
function getMainAxisFromPlacement(placement) {
  return ["top", "bottom"].indexOf(placement) >= 0 ? "x" : "y";
}
function within(min$1, value, max$1) {
  return max(min$1, min(value, max$1));
}
function withinMaxClamp(min2, value, max2) {
  var v = within(min2, value, max2);
  return v > max2 ? max2 : v;
}
function getFreshSideObject() {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
}
function mergePaddingObject(paddingObject) {
  return Object.assign({}, getFreshSideObject(), paddingObject);
}
function expandToHashMap(value, keys) {
  return keys.reduce(function(hashMap, key) {
    hashMap[key] = value;
    return hashMap;
  }, {});
}
var toPaddingObject = function toPaddingObject2(padding, state) {
  padding = typeof padding === "function" ? padding(Object.assign({}, state.rects, {
    placement: state.placement
  })) : padding;
  return mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
};
function arrow(_ref) {
  var _state$modifiersData$;
  var state = _ref.state, name = _ref.name, options = _ref.options;
  var arrowElement = state.elements.arrow;
  var popperOffsets2 = state.modifiersData.popperOffsets;
  var basePlacement = getBasePlacement$1(state.placement);
  var axis = getMainAxisFromPlacement(basePlacement);
  var isVertical = [left, right].indexOf(basePlacement) >= 0;
  var len = isVertical ? "height" : "width";
  if (!arrowElement || !popperOffsets2) {
    return;
  }
  var paddingObject = toPaddingObject(options.padding, state);
  var arrowRect = getLayoutRect(arrowElement);
  var minProp = axis === "y" ? top : left;
  var maxProp = axis === "y" ? bottom : right;
  var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets2[axis] - state.rects.popper[len];
  var startDiff = popperOffsets2[axis] - state.rects.reference[axis];
  var arrowOffsetParent = getOffsetParent(arrowElement);
  var clientSize = arrowOffsetParent ? axis === "y" ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
  var centerToReference = endDiff / 2 - startDiff / 2;
  var min2 = paddingObject[minProp];
  var max2 = clientSize - arrowRect[len] - paddingObject[maxProp];
  var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
  var offset2 = within(min2, center, max2);
  var axisProp = axis;
  state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset2, _state$modifiersData$.centerOffset = offset2 - center, _state$modifiersData$);
}
function effect$1(_ref2) {
  var state = _ref2.state, options = _ref2.options;
  var _options$element = options.element, arrowElement = _options$element === void 0 ? "[data-popper-arrow]" : _options$element;
  if (arrowElement == null) {
    return;
  }
  if (typeof arrowElement === "string") {
    arrowElement = state.elements.popper.querySelector(arrowElement);
    if (!arrowElement) {
      return;
    }
  }
  if (!contains(state.elements.popper, arrowElement)) {
    return;
  }
  state.elements.arrow = arrowElement;
}
const arrow$1 = {
  name: "arrow",
  enabled: true,
  phase: "main",
  fn: arrow,
  effect: effect$1,
  requires: ["popperOffsets"],
  requiresIfExists: ["preventOverflow"]
};
function getVariation(placement) {
  return placement.split("-")[1];
}
var unsetSides = {
  top: "auto",
  right: "auto",
  bottom: "auto",
  left: "auto"
};
function roundOffsetsByDPR(_ref, win) {
  var x = _ref.x, y = _ref.y;
  var dpr = win.devicePixelRatio || 1;
  return {
    x: round(x * dpr) / dpr || 0,
    y: round(y * dpr) / dpr || 0
  };
}
function mapToStyles(_ref2) {
  var _Object$assign2;
  var popper2 = _ref2.popper, popperRect = _ref2.popperRect, placement = _ref2.placement, variation = _ref2.variation, offsets = _ref2.offsets, position = _ref2.position, gpuAcceleration = _ref2.gpuAcceleration, adaptive = _ref2.adaptive, roundOffsets = _ref2.roundOffsets, isFixed = _ref2.isFixed;
  var _offsets$x = offsets.x, x = _offsets$x === void 0 ? 0 : _offsets$x, _offsets$y = offsets.y, y = _offsets$y === void 0 ? 0 : _offsets$y;
  var _ref3 = typeof roundOffsets === "function" ? roundOffsets({
    x,
    y
  }) : {
    x,
    y
  };
  x = _ref3.x;
  y = _ref3.y;
  var hasX = offsets.hasOwnProperty("x");
  var hasY = offsets.hasOwnProperty("y");
  var sideX = left;
  var sideY = top;
  var win = window;
  if (adaptive) {
    var offsetParent = getOffsetParent(popper2);
    var heightProp = "clientHeight";
    var widthProp = "clientWidth";
    if (offsetParent === getWindow(popper2)) {
      offsetParent = getDocumentElement(popper2);
      if (getComputedStyle$1(offsetParent).position !== "static" && position === "absolute") {
        heightProp = "scrollHeight";
        widthProp = "scrollWidth";
      }
    }
    offsetParent = offsetParent;
    if (placement === top || (placement === left || placement === right) && variation === end) {
      sideY = bottom;
      var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : (
        // $FlowFixMe[prop-missing]
        offsetParent[heightProp]
      );
      y -= offsetY - popperRect.height;
      y *= gpuAcceleration ? 1 : -1;
    }
    if (placement === left || (placement === top || placement === bottom) && variation === end) {
      sideX = right;
      var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : (
        // $FlowFixMe[prop-missing]
        offsetParent[widthProp]
      );
      x -= offsetX - popperRect.width;
      x *= gpuAcceleration ? 1 : -1;
    }
  }
  var commonStyles = Object.assign({
    position
  }, adaptive && unsetSides);
  var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
    x,
    y
  }, getWindow(popper2)) : {
    x,
    y
  };
  x = _ref4.x;
  y = _ref4.y;
  if (gpuAcceleration) {
    var _Object$assign;
    return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? "0" : "", _Object$assign[sideX] = hasX ? "0" : "", _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
  }
  return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : "", _Object$assign2[sideX] = hasX ? x + "px" : "", _Object$assign2.transform = "", _Object$assign2));
}
function computeStyles(_ref5) {
  var state = _ref5.state, options = _ref5.options;
  var _options$gpuAccelerat = options.gpuAcceleration, gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat, _options$adaptive = options.adaptive, adaptive = _options$adaptive === void 0 ? true : _options$adaptive, _options$roundOffsets = options.roundOffsets, roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
  var commonStyles = {
    placement: getBasePlacement$1(state.placement),
    variation: getVariation(state.placement),
    popper: state.elements.popper,
    popperRect: state.rects.popper,
    gpuAcceleration,
    isFixed: state.options.strategy === "fixed"
  };
  if (state.modifiersData.popperOffsets != null) {
    state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.popperOffsets,
      position: state.options.strategy,
      adaptive,
      roundOffsets
    })));
  }
  if (state.modifiersData.arrow != null) {
    state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.arrow,
      position: "absolute",
      adaptive: false,
      roundOffsets
    })));
  }
  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    "data-popper-placement": state.placement
  });
}
const computeStyles$1 = {
  name: "computeStyles",
  enabled: true,
  phase: "beforeWrite",
  fn: computeStyles,
  data: {}
};
var passive = {
  passive: true
};
function effect(_ref) {
  var state = _ref.state, instance2 = _ref.instance, options = _ref.options;
  var _options$scroll = options.scroll, scroll = _options$scroll === void 0 ? true : _options$scroll, _options$resize = options.resize, resize = _options$resize === void 0 ? true : _options$resize;
  var window2 = getWindow(state.elements.popper);
  var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);
  if (scroll) {
    scrollParents.forEach(function(scrollParent) {
      scrollParent.addEventListener("scroll", instance2.update, passive);
    });
  }
  if (resize) {
    window2.addEventListener("resize", instance2.update, passive);
  }
  return function() {
    if (scroll) {
      scrollParents.forEach(function(scrollParent) {
        scrollParent.removeEventListener("scroll", instance2.update, passive);
      });
    }
    if (resize) {
      window2.removeEventListener("resize", instance2.update, passive);
    }
  };
}
const eventListeners = {
  name: "eventListeners",
  enabled: true,
  phase: "write",
  fn: function fn() {
  },
  effect,
  data: {}
};
var hash$1 = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, function(matched) {
    return hash$1[matched];
  });
}
var hash = {
  start: "end",
  end: "start"
};
function getOppositeVariationPlacement(placement) {
  return placement.replace(/start|end/g, function(matched) {
    return hash[matched];
  });
}
function getWindowScroll(node) {
  var win = getWindow(node);
  var scrollLeft = win.pageXOffset;
  var scrollTop = win.pageYOffset;
  return {
    scrollLeft,
    scrollTop
  };
}
function getWindowScrollBarX(element2) {
  return getBoundingClientRect(getDocumentElement(element2)).left + getWindowScroll(element2).scrollLeft;
}
function getViewportRect(element2, strategy) {
  var win = getWindow(element2);
  var html2 = getDocumentElement(element2);
  var visualViewport = win.visualViewport;
  var width = html2.clientWidth;
  var height = html2.clientHeight;
  var x = 0;
  var y = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    var layoutViewport = isLayoutViewport();
    if (layoutViewport || !layoutViewport && strategy === "fixed") {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }
  return {
    width,
    height,
    x: x + getWindowScrollBarX(element2),
    y
  };
}
function getDocumentRect(element2) {
  var _element$ownerDocumen;
  var html2 = getDocumentElement(element2);
  var winScroll = getWindowScroll(element2);
  var body = (_element$ownerDocumen = element2.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
  var width = max(html2.scrollWidth, html2.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
  var height = max(html2.scrollHeight, html2.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
  var x = -winScroll.scrollLeft + getWindowScrollBarX(element2);
  var y = -winScroll.scrollTop;
  if (getComputedStyle$1(body || html2).direction === "rtl") {
    x += max(html2.clientWidth, body ? body.clientWidth : 0) - width;
  }
  return {
    width,
    height,
    x,
    y
  };
}
function isScrollParent(element2) {
  var _getComputedStyle = getComputedStyle$1(element2), overflow = _getComputedStyle.overflow, overflowX = _getComputedStyle.overflowX, overflowY = _getComputedStyle.overflowY;
  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
}
function getScrollParent(node) {
  if (["html", "body", "#document"].indexOf(getNodeName(node)) >= 0) {
    return node.ownerDocument.body;
  }
  if (isHTMLElement(node) && isScrollParent(node)) {
    return node;
  }
  return getScrollParent(getParentNode(node));
}
function listScrollParents(element2, list) {
  var _element$ownerDocumen;
  if (list === void 0) {
    list = [];
  }
  var scrollParent = getScrollParent(element2);
  var isBody = scrollParent === ((_element$ownerDocumen = element2.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
  var win = getWindow(scrollParent);
  var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
  var updatedList = list.concat(target);
  return isBody ? updatedList : (
    // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
    updatedList.concat(listScrollParents(getParentNode(target)))
  );
}
function rectToClientRect(rect) {
  return Object.assign({}, rect, {
    left: rect.x,
    top: rect.y,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height
  });
}
function getInnerBoundingClientRect(element2, strategy) {
  var rect = getBoundingClientRect(element2, false, strategy === "fixed");
  rect.top = rect.top + element2.clientTop;
  rect.left = rect.left + element2.clientLeft;
  rect.bottom = rect.top + element2.clientHeight;
  rect.right = rect.left + element2.clientWidth;
  rect.width = element2.clientWidth;
  rect.height = element2.clientHeight;
  rect.x = rect.left;
  rect.y = rect.top;
  return rect;
}
function getClientRectFromMixedType(element2, clippingParent, strategy) {
  return clippingParent === viewport ? rectToClientRect(getViewportRect(element2, strategy)) : isElement$1(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element2)));
}
function getClippingParents(element2) {
  var clippingParents2 = listScrollParents(getParentNode(element2));
  var canEscapeClipping = ["absolute", "fixed"].indexOf(getComputedStyle$1(element2).position) >= 0;
  var clipperElement = canEscapeClipping && isHTMLElement(element2) ? getOffsetParent(element2) : element2;
  if (!isElement$1(clipperElement)) {
    return [];
  }
  return clippingParents2.filter(function(clippingParent) {
    return isElement$1(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== "body";
  });
}
function getClippingRect(element2, boundary, rootBoundary, strategy) {
  var mainClippingParents = boundary === "clippingParents" ? getClippingParents(element2) : [].concat(boundary);
  var clippingParents2 = [].concat(mainClippingParents, [rootBoundary]);
  var firstClippingParent = clippingParents2[0];
  var clippingRect = clippingParents2.reduce(function(accRect, clippingParent) {
    var rect = getClientRectFromMixedType(element2, clippingParent, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromMixedType(element2, firstClippingParent, strategy));
  clippingRect.width = clippingRect.right - clippingRect.left;
  clippingRect.height = clippingRect.bottom - clippingRect.top;
  clippingRect.x = clippingRect.left;
  clippingRect.y = clippingRect.top;
  return clippingRect;
}
function computeOffsets(_ref) {
  var reference2 = _ref.reference, element2 = _ref.element, placement = _ref.placement;
  var basePlacement = placement ? getBasePlacement$1(placement) : null;
  var variation = placement ? getVariation(placement) : null;
  var commonX = reference2.x + reference2.width / 2 - element2.width / 2;
  var commonY = reference2.y + reference2.height / 2 - element2.height / 2;
  var offsets;
  switch (basePlacement) {
    case top:
      offsets = {
        x: commonX,
        y: reference2.y - element2.height
      };
      break;
    case bottom:
      offsets = {
        x: commonX,
        y: reference2.y + reference2.height
      };
      break;
    case right:
      offsets = {
        x: reference2.x + reference2.width,
        y: commonY
      };
      break;
    case left:
      offsets = {
        x: reference2.x - element2.width,
        y: commonY
      };
      break;
    default:
      offsets = {
        x: reference2.x,
        y: reference2.y
      };
  }
  var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
  if (mainAxis != null) {
    var len = mainAxis === "y" ? "height" : "width";
    switch (variation) {
      case start:
        offsets[mainAxis] = offsets[mainAxis] - (reference2[len] / 2 - element2[len] / 2);
        break;
      case end:
        offsets[mainAxis] = offsets[mainAxis] + (reference2[len] / 2 - element2[len] / 2);
        break;
    }
  }
  return offsets;
}
function detectOverflow(state, options) {
  if (options === void 0) {
    options = {};
  }
  var _options = options, _options$placement = _options.placement, placement = _options$placement === void 0 ? state.placement : _options$placement, _options$strategy = _options.strategy, strategy = _options$strategy === void 0 ? state.strategy : _options$strategy, _options$boundary = _options.boundary, boundary = _options$boundary === void 0 ? clippingParents : _options$boundary, _options$rootBoundary = _options.rootBoundary, rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary, _options$elementConte = _options.elementContext, elementContext = _options$elementConte === void 0 ? popper : _options$elementConte, _options$altBoundary = _options.altBoundary, altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary, _options$padding = _options.padding, padding = _options$padding === void 0 ? 0 : _options$padding;
  var paddingObject = mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
  var altContext = elementContext === popper ? reference : popper;
  var popperRect = state.rects.popper;
  var element2 = state.elements[altBoundary ? altContext : elementContext];
  var clippingClientRect = getClippingRect(isElement$1(element2) ? element2 : element2.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
  var referenceClientRect = getBoundingClientRect(state.elements.reference);
  var popperOffsets2 = computeOffsets({
    reference: referenceClientRect,
    element: popperRect,
    placement
  });
  var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets2));
  var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect;
  var overflowOffsets = {
    top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
    bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
    left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
    right: elementClientRect.right - clippingClientRect.right + paddingObject.right
  };
  var offsetData = state.modifiersData.offset;
  if (elementContext === popper && offsetData) {
    var offset2 = offsetData[placement];
    Object.keys(overflowOffsets).forEach(function(key) {
      var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
      var axis = [top, bottom].indexOf(key) >= 0 ? "y" : "x";
      overflowOffsets[key] += offset2[axis] * multiply;
    });
  }
  return overflowOffsets;
}
function computeAutoPlacement(state, options) {
  if (options === void 0) {
    options = {};
  }
  var _options = options, placement = _options.placement, boundary = _options.boundary, rootBoundary = _options.rootBoundary, padding = _options.padding, flipVariations = _options.flipVariations, _options$allowedAutoP = _options.allowedAutoPlacements, allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
  var variation = getVariation(placement);
  var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function(placement2) {
    return getVariation(placement2) === variation;
  }) : basePlacements;
  var allowedPlacements = placements$1.filter(function(placement2) {
    return allowedAutoPlacements.indexOf(placement2) >= 0;
  });
  if (allowedPlacements.length === 0) {
    allowedPlacements = placements$1;
  }
  var overflows = allowedPlacements.reduce(function(acc, placement2) {
    acc[placement2] = detectOverflow(state, {
      placement: placement2,
      boundary,
      rootBoundary,
      padding
    })[getBasePlacement$1(placement2)];
    return acc;
  }, {});
  return Object.keys(overflows).sort(function(a, b) {
    return overflows[a] - overflows[b];
  });
}
function getExpandedFallbackPlacements(placement) {
  if (getBasePlacement$1(placement) === auto) {
    return [];
  }
  var oppositePlacement = getOppositePlacement(placement);
  return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
}
function flip(_ref) {
  var state = _ref.state, options = _ref.options, name = _ref.name;
  if (state.modifiersData[name]._skip) {
    return;
  }
  var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis, specifiedFallbackPlacements = options.fallbackPlacements, padding = options.padding, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, _options$flipVariatio = options.flipVariations, flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio, allowedAutoPlacements = options.allowedAutoPlacements;
  var preferredPlacement = state.options.placement;
  var basePlacement = getBasePlacement$1(preferredPlacement);
  var isBasePlacement = basePlacement === preferredPlacement;
  var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
  var placements2 = [preferredPlacement].concat(fallbackPlacements).reduce(function(acc, placement2) {
    return acc.concat(getBasePlacement$1(placement2) === auto ? computeAutoPlacement(state, {
      placement: placement2,
      boundary,
      rootBoundary,
      padding,
      flipVariations,
      allowedAutoPlacements
    }) : placement2);
  }, []);
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var checksMap = /* @__PURE__ */ new Map();
  var makeFallbackChecks = true;
  var firstFittingPlacement = placements2[0];
  for (var i = 0; i < placements2.length; i++) {
    var placement = placements2[i];
    var _basePlacement = getBasePlacement$1(placement);
    var isStartVariation = getVariation(placement) === start;
    var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
    var len = isVertical ? "width" : "height";
    var overflow = detectOverflow(state, {
      placement,
      boundary,
      rootBoundary,
      altBoundary,
      padding
    });
    var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;
    if (referenceRect[len] > popperRect[len]) {
      mainVariationSide = getOppositePlacement(mainVariationSide);
    }
    var altVariationSide = getOppositePlacement(mainVariationSide);
    var checks = [];
    if (checkMainAxis) {
      checks.push(overflow[_basePlacement] <= 0);
    }
    if (checkAltAxis) {
      checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
    }
    if (checks.every(function(check) {
      return check;
    })) {
      firstFittingPlacement = placement;
      makeFallbackChecks = false;
      break;
    }
    checksMap.set(placement, checks);
  }
  if (makeFallbackChecks) {
    var numberOfChecks = flipVariations ? 3 : 1;
    var _loop = function _loop2(_i2) {
      var fittingPlacement = placements2.find(function(placement2) {
        var checks2 = checksMap.get(placement2);
        if (checks2) {
          return checks2.slice(0, _i2).every(function(check) {
            return check;
          });
        }
      });
      if (fittingPlacement) {
        firstFittingPlacement = fittingPlacement;
        return "break";
      }
    };
    for (var _i = numberOfChecks; _i > 0; _i--) {
      var _ret = _loop(_i);
      if (_ret === "break") break;
    }
  }
  if (state.placement !== firstFittingPlacement) {
    state.modifiersData[name]._skip = true;
    state.placement = firstFittingPlacement;
    state.reset = true;
  }
}
const flip$1 = {
  name: "flip",
  enabled: true,
  phase: "main",
  fn: flip,
  requiresIfExists: ["offset"],
  data: {
    _skip: false
  }
};
function getSideOffsets(overflow, rect, preventedOffsets) {
  if (preventedOffsets === void 0) {
    preventedOffsets = {
      x: 0,
      y: 0
    };
  }
  return {
    top: overflow.top - rect.height - preventedOffsets.y,
    right: overflow.right - rect.width + preventedOffsets.x,
    bottom: overflow.bottom - rect.height + preventedOffsets.y,
    left: overflow.left - rect.width - preventedOffsets.x
  };
}
function isAnySideFullyClipped(overflow) {
  return [top, right, bottom, left].some(function(side) {
    return overflow[side] >= 0;
  });
}
function hide(_ref) {
  var state = _ref.state, name = _ref.name;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var preventedOffsets = state.modifiersData.preventOverflow;
  var referenceOverflow = detectOverflow(state, {
    elementContext: "reference"
  });
  var popperAltOverflow = detectOverflow(state, {
    altBoundary: true
  });
  var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
  var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
  var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
  var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
  state.modifiersData[name] = {
    referenceClippingOffsets,
    popperEscapeOffsets,
    isReferenceHidden,
    hasPopperEscaped
  };
  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    "data-popper-reference-hidden": isReferenceHidden,
    "data-popper-escaped": hasPopperEscaped
  });
}
const hide$1 = {
  name: "hide",
  enabled: true,
  phase: "main",
  requiresIfExists: ["preventOverflow"],
  fn: hide
};
function distanceAndSkiddingToXY(placement, rects, offset2) {
  var basePlacement = getBasePlacement$1(placement);
  var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;
  var _ref = typeof offset2 === "function" ? offset2(Object.assign({}, rects, {
    placement
  })) : offset2, skidding = _ref[0], distance = _ref[1];
  skidding = skidding || 0;
  distance = (distance || 0) * invertDistance;
  return [left, right].indexOf(basePlacement) >= 0 ? {
    x: distance,
    y: skidding
  } : {
    x: skidding,
    y: distance
  };
}
function offset(_ref2) {
  var state = _ref2.state, options = _ref2.options, name = _ref2.name;
  var _options$offset = options.offset, offset2 = _options$offset === void 0 ? [0, 0] : _options$offset;
  var data = placements.reduce(function(acc, placement) {
    acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset2);
    return acc;
  }, {});
  var _data$state$placement = data[state.placement], x = _data$state$placement.x, y = _data$state$placement.y;
  if (state.modifiersData.popperOffsets != null) {
    state.modifiersData.popperOffsets.x += x;
    state.modifiersData.popperOffsets.y += y;
  }
  state.modifiersData[name] = data;
}
const offset$1 = {
  name: "offset",
  enabled: true,
  phase: "main",
  requires: ["popperOffsets"],
  fn: offset
};
function popperOffsets(_ref) {
  var state = _ref.state, name = _ref.name;
  state.modifiersData[name] = computeOffsets({
    reference: state.rects.reference,
    element: state.rects.popper,
    placement: state.placement
  });
}
const popperOffsets$1 = {
  name: "popperOffsets",
  enabled: true,
  phase: "read",
  fn: popperOffsets,
  data: {}
};
function getAltAxis(axis) {
  return axis === "x" ? "y" : "x";
}
function preventOverflow(_ref) {
  var state = _ref.state, options = _ref.options, name = _ref.name;
  var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, padding = options.padding, _options$tether = options.tether, tether = _options$tether === void 0 ? true : _options$tether, _options$tetherOffset = options.tetherOffset, tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
  var overflow = detectOverflow(state, {
    boundary,
    rootBoundary,
    padding,
    altBoundary
  });
  var basePlacement = getBasePlacement$1(state.placement);
  var variation = getVariation(state.placement);
  var isBasePlacement = !variation;
  var mainAxis = getMainAxisFromPlacement(basePlacement);
  var altAxis = getAltAxis(mainAxis);
  var popperOffsets2 = state.modifiersData.popperOffsets;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var tetherOffsetValue = typeof tetherOffset === "function" ? tetherOffset(Object.assign({}, state.rects, {
    placement: state.placement
  })) : tetherOffset;
  var normalizedTetherOffsetValue = typeof tetherOffsetValue === "number" ? {
    mainAxis: tetherOffsetValue,
    altAxis: tetherOffsetValue
  } : Object.assign({
    mainAxis: 0,
    altAxis: 0
  }, tetherOffsetValue);
  var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
  var data = {
    x: 0,
    y: 0
  };
  if (!popperOffsets2) {
    return;
  }
  if (checkMainAxis) {
    var _offsetModifierState$;
    var mainSide = mainAxis === "y" ? top : left;
    var altSide = mainAxis === "y" ? bottom : right;
    var len = mainAxis === "y" ? "height" : "width";
    var offset2 = popperOffsets2[mainAxis];
    var min$1 = offset2 + overflow[mainSide];
    var max$1 = offset2 - overflow[altSide];
    var additive = tether ? -popperRect[len] / 2 : 0;
    var minLen = variation === start ? referenceRect[len] : popperRect[len];
    var maxLen = variation === start ? -popperRect[len] : -referenceRect[len];
    var arrowElement = state.elements.arrow;
    var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
      width: 0,
      height: 0
    };
    var arrowPaddingObject = state.modifiersData["arrow#persistent"] ? state.modifiersData["arrow#persistent"].padding : getFreshSideObject();
    var arrowPaddingMin = arrowPaddingObject[mainSide];
    var arrowPaddingMax = arrowPaddingObject[altSide];
    var arrowLen = within(0, referenceRect[len], arrowRect[len]);
    var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
    var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
    var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
    var clientOffset = arrowOffsetParent ? mainAxis === "y" ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
    var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
    var tetherMin = offset2 + minOffset - offsetModifierValue - clientOffset;
    var tetherMax = offset2 + maxOffset - offsetModifierValue;
    var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset2, tether ? max(max$1, tetherMax) : max$1);
    popperOffsets2[mainAxis] = preventedOffset;
    data[mainAxis] = preventedOffset - offset2;
  }
  if (checkAltAxis) {
    var _offsetModifierState$2;
    var _mainSide = mainAxis === "x" ? top : left;
    var _altSide = mainAxis === "x" ? bottom : right;
    var _offset = popperOffsets2[altAxis];
    var _len = altAxis === "y" ? "height" : "width";
    var _min = _offset + overflow[_mainSide];
    var _max = _offset - overflow[_altSide];
    var isOriginSide = [top, left].indexOf(basePlacement) !== -1;
    var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;
    var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;
    var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;
    var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);
    popperOffsets2[altAxis] = _preventedOffset;
    data[altAxis] = _preventedOffset - _offset;
  }
  state.modifiersData[name] = data;
}
const preventOverflow$1 = {
  name: "preventOverflow",
  enabled: true,
  phase: "main",
  fn: preventOverflow,
  requiresIfExists: ["offset"]
};
function getHTMLElementScroll(element2) {
  return {
    scrollLeft: element2.scrollLeft,
    scrollTop: element2.scrollTop
  };
}
function getNodeScroll(node) {
  if (node === getWindow(node) || !isHTMLElement(node)) {
    return getWindowScroll(node);
  } else {
    return getHTMLElementScroll(node);
  }
}
function isElementScaled(element2) {
  var rect = element2.getBoundingClientRect();
  var scaleX = round(rect.width) / element2.offsetWidth || 1;
  var scaleY = round(rect.height) / element2.offsetHeight || 1;
  return scaleX !== 1 || scaleY !== 1;
}
function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  var isOffsetParentAnElement = isHTMLElement(offsetParent);
  var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
  var documentElement = getDocumentElement(offsetParent);
  var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
  var scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  var offsets = {
    x: 0,
    y: 0
  };
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || // https://github.com/popperjs/popper-core/issues/1078
    isScrollParent(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      offsets = getBoundingClientRect(offsetParent, true);
      offsets.x += offsetParent.clientLeft;
      offsets.y += offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }
  return {
    x: rect.left + scroll.scrollLeft - offsets.x,
    y: rect.top + scroll.scrollTop - offsets.y,
    width: rect.width,
    height: rect.height
  };
}
function order(modifiers) {
  var map = /* @__PURE__ */ new Map();
  var visited = /* @__PURE__ */ new Set();
  var result = [];
  modifiers.forEach(function(modifier) {
    map.set(modifier.name, modifier);
  });
  function sort(modifier) {
    visited.add(modifier.name);
    var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
    requires.forEach(function(dep) {
      if (!visited.has(dep)) {
        var depModifier = map.get(dep);
        if (depModifier) {
          sort(depModifier);
        }
      }
    });
    result.push(modifier);
  }
  modifiers.forEach(function(modifier) {
    if (!visited.has(modifier.name)) {
      sort(modifier);
    }
  });
  return result;
}
function orderModifiers(modifiers) {
  var orderedModifiers = order(modifiers);
  return modifierPhases.reduce(function(acc, phase) {
    return acc.concat(orderedModifiers.filter(function(modifier) {
      return modifier.phase === phase;
    }));
  }, []);
}
function debounce$1(fn2) {
  var pending;
  return function() {
    if (!pending) {
      pending = new Promise(function(resolve) {
        Promise.resolve().then(function() {
          pending = void 0;
          resolve(fn2());
        });
      });
    }
    return pending;
  };
}
function mergeByName(modifiers) {
  var merged = modifiers.reduce(function(merged2, current) {
    var existing = merged2[current.name];
    merged2[current.name] = existing ? Object.assign({}, existing, current, {
      options: Object.assign({}, existing.options, current.options),
      data: Object.assign({}, existing.data, current.data)
    }) : current;
    return merged2;
  }, {});
  return Object.keys(merged).map(function(key) {
    return merged[key];
  });
}
var DEFAULT_OPTIONS = {
  placement: "bottom",
  modifiers: [],
  strategy: "absolute"
};
function areValidElements() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  return !args.some(function(element2) {
    return !(element2 && typeof element2.getBoundingClientRect === "function");
  });
}
function popperGenerator(generatorOptions) {
  if (generatorOptions === void 0) {
    generatorOptions = {};
  }
  var _generatorOptions = generatorOptions, _generatorOptions$def = _generatorOptions.defaultModifiers, defaultModifiers2 = _generatorOptions$def === void 0 ? [] : _generatorOptions$def, _generatorOptions$def2 = _generatorOptions.defaultOptions, defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
  return function createPopper2(reference2, popper2, options) {
    if (options === void 0) {
      options = defaultOptions;
    }
    var state = {
      placement: "bottom",
      orderedModifiers: [],
      options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
      modifiersData: {},
      elements: {
        reference: reference2,
        popper: popper2
      },
      attributes: {},
      styles: {}
    };
    var effectCleanupFns = [];
    var isDestroyed = false;
    var instance2 = {
      state,
      setOptions: function setOptions(setOptionsAction) {
        var options2 = typeof setOptionsAction === "function" ? setOptionsAction(state.options) : setOptionsAction;
        cleanupModifierEffects();
        state.options = Object.assign({}, defaultOptions, state.options, options2);
        state.scrollParents = {
          reference: isElement$1(reference2) ? listScrollParents(reference2) : reference2.contextElement ? listScrollParents(reference2.contextElement) : [],
          popper: listScrollParents(popper2)
        };
        var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers2, state.options.modifiers)));
        state.orderedModifiers = orderedModifiers.filter(function(m) {
          return m.enabled;
        });
        runModifierEffects();
        return instance2.update();
      },
      // Sync update – it will always be executed, even if not necessary. This
      // is useful for low frequency updates where sync behavior simplifies the
      // logic.
      // For high frequency updates (e.g. `resize` and `scroll` events), always
      // prefer the async Popper#update method
      forceUpdate: function forceUpdate() {
        if (isDestroyed) {
          return;
        }
        var _state$elements = state.elements, reference3 = _state$elements.reference, popper3 = _state$elements.popper;
        if (!areValidElements(reference3, popper3)) {
          return;
        }
        state.rects = {
          reference: getCompositeRect(reference3, getOffsetParent(popper3), state.options.strategy === "fixed"),
          popper: getLayoutRect(popper3)
        };
        state.reset = false;
        state.placement = state.options.placement;
        state.orderedModifiers.forEach(function(modifier) {
          return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
        });
        for (var index = 0; index < state.orderedModifiers.length; index++) {
          if (state.reset === true) {
            state.reset = false;
            index = -1;
            continue;
          }
          var _state$orderedModifie = state.orderedModifiers[index], fn2 = _state$orderedModifie.fn, _state$orderedModifie2 = _state$orderedModifie.options, _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2, name = _state$orderedModifie.name;
          if (typeof fn2 === "function") {
            state = fn2({
              state,
              options: _options,
              name,
              instance: instance2
            }) || state;
          }
        }
      },
      // Async and optimistically optimized update – it will not be executed if
      // not necessary (debounced to run at most once-per-tick)
      update: debounce$1(function() {
        return new Promise(function(resolve) {
          instance2.forceUpdate();
          resolve(state);
        });
      }),
      destroy: function destroy() {
        cleanupModifierEffects();
        isDestroyed = true;
      }
    };
    if (!areValidElements(reference2, popper2)) {
      return instance2;
    }
    instance2.setOptions(options).then(function(state2) {
      if (!isDestroyed && options.onFirstUpdate) {
        options.onFirstUpdate(state2);
      }
    });
    function runModifierEffects() {
      state.orderedModifiers.forEach(function(_ref) {
        var name = _ref.name, _ref$options = _ref.options, options2 = _ref$options === void 0 ? {} : _ref$options, effect3 = _ref.effect;
        if (typeof effect3 === "function") {
          var cleanupFn = effect3({
            state,
            name,
            instance: instance2,
            options: options2
          });
          var noopFn = function noopFn2() {
          };
          effectCleanupFns.push(cleanupFn || noopFn);
        }
      });
    }
    function cleanupModifierEffects() {
      effectCleanupFns.forEach(function(fn2) {
        return fn2();
      });
      effectCleanupFns = [];
    }
    return instance2;
  };
}
var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1];
var createPopper = /* @__PURE__ */ popperGenerator({
  defaultModifiers
});
var BOX_CLASS = "tippy-box";
var CONTENT_CLASS = "tippy-content";
var BACKDROP_CLASS = "tippy-backdrop";
var ARROW_CLASS = "tippy-arrow";
var SVG_ARROW_CLASS = "tippy-svg-arrow";
var TOUCH_OPTIONS = {
  passive: true,
  capture: true
};
var TIPPY_DEFAULT_APPEND_TO = function TIPPY_DEFAULT_APPEND_TO2() {
  return document.body;
};
function getValueAtIndexOrReturn(value, index, defaultValue) {
  if (Array.isArray(value)) {
    var v = value[index];
    return v == null ? Array.isArray(defaultValue) ? defaultValue[index] : defaultValue : v;
  }
  return value;
}
function isType(value, type) {
  var str = {}.toString.call(value);
  return str.indexOf("[object") === 0 && str.indexOf(type + "]") > -1;
}
function invokeWithArgsOrReturn(value, args) {
  return typeof value === "function" ? value.apply(void 0, args) : value;
}
function debounce(fn5, ms) {
  if (ms === 0) {
    return fn5;
  }
  var timeout;
  return function(arg) {
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      fn5(arg);
    }, ms);
  };
}
function splitBySpaces(value) {
  return value.split(/\s+/).filter(Boolean);
}
function normalizeToArray(value) {
  return [].concat(value);
}
function pushIfUnique(arr, value) {
  if (arr.indexOf(value) === -1) {
    arr.push(value);
  }
}
function unique(arr) {
  return arr.filter(function(item, index) {
    return arr.indexOf(item) === index;
  });
}
function getBasePlacement(placement) {
  return placement.split("-")[0];
}
function arrayFrom(value) {
  return [].slice.call(value);
}
function removeUndefinedProps(obj) {
  return Object.keys(obj).reduce(function(acc, key) {
    if (obj[key] !== void 0) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}
function div() {
  return document.createElement("div");
}
function isElement(value) {
  return ["Element", "Fragment"].some(function(type) {
    return isType(value, type);
  });
}
function isNodeList(value) {
  return isType(value, "NodeList");
}
function isMouseEvent(value) {
  return isType(value, "MouseEvent");
}
function isReferenceElement(value) {
  return !!(value && value._tippy && value._tippy.reference === value);
}
function getArrayOfElements(value) {
  if (isElement(value)) {
    return [value];
  }
  if (isNodeList(value)) {
    return arrayFrom(value);
  }
  if (Array.isArray(value)) {
    return value;
  }
  return arrayFrom(document.querySelectorAll(value));
}
function setTransitionDuration(els, value) {
  els.forEach(function(el) {
    if (el) {
      el.style.transitionDuration = value + "ms";
    }
  });
}
function setVisibilityState(els, state) {
  els.forEach(function(el) {
    if (el) {
      el.setAttribute("data-state", state);
    }
  });
}
function getOwnerDocument(elementOrElements) {
  var _element$ownerDocumen;
  var _normalizeToArray = normalizeToArray(elementOrElements), element2 = _normalizeToArray[0];
  return element2 != null && (_element$ownerDocumen = element2.ownerDocument) != null && _element$ownerDocumen.body ? element2.ownerDocument : document;
}
function isCursorOutsideInteractiveBorder(popperTreeData, event) {
  var clientX = event.clientX, clientY = event.clientY;
  return popperTreeData.every(function(_ref) {
    var popperRect = _ref.popperRect, popperState = _ref.popperState, props = _ref.props;
    var interactiveBorder = props.interactiveBorder;
    var basePlacement = getBasePlacement(popperState.placement);
    var offsetData = popperState.modifiersData.offset;
    if (!offsetData) {
      return true;
    }
    var topDistance = basePlacement === "bottom" ? offsetData.top.y : 0;
    var bottomDistance = basePlacement === "top" ? offsetData.bottom.y : 0;
    var leftDistance = basePlacement === "right" ? offsetData.left.x : 0;
    var rightDistance = basePlacement === "left" ? offsetData.right.x : 0;
    var exceedsTop = popperRect.top - clientY + topDistance > interactiveBorder;
    var exceedsBottom = clientY - popperRect.bottom - bottomDistance > interactiveBorder;
    var exceedsLeft = popperRect.left - clientX + leftDistance > interactiveBorder;
    var exceedsRight = clientX - popperRect.right - rightDistance > interactiveBorder;
    return exceedsTop || exceedsBottom || exceedsLeft || exceedsRight;
  });
}
function updateTransitionEndListener(box, action, listener) {
  var method = action + "EventListener";
  ["transitionend", "webkitTransitionEnd"].forEach(function(event) {
    box[method](event, listener);
  });
}
function actualContains(parent, child) {
  var target = child;
  while (target) {
    var _target$getRootNode;
    if (parent.contains(target)) {
      return true;
    }
    target = target.getRootNode == null ? void 0 : (_target$getRootNode = target.getRootNode()) == null ? void 0 : _target$getRootNode.host;
  }
  return false;
}
var currentInput = {
  isTouch: false
};
var lastMouseMoveTime = 0;
function onDocumentTouchStart() {
  if (currentInput.isTouch) {
    return;
  }
  currentInput.isTouch = true;
  if (window.performance) {
    document.addEventListener("mousemove", onDocumentMouseMove);
  }
}
function onDocumentMouseMove() {
  var now2 = performance.now();
  if (now2 - lastMouseMoveTime < 20) {
    currentInput.isTouch = false;
    document.removeEventListener("mousemove", onDocumentMouseMove);
  }
  lastMouseMoveTime = now2;
}
function onWindowBlur() {
  var activeElement = document.activeElement;
  if (isReferenceElement(activeElement)) {
    var instance2 = activeElement._tippy;
    if (activeElement.blur && !instance2.state.isVisible) {
      activeElement.blur();
    }
  }
}
function bindGlobalEventListeners() {
  document.addEventListener("touchstart", onDocumentTouchStart, TOUCH_OPTIONS);
  window.addEventListener("blur", onWindowBlur);
}
var isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
var isIE11 = isBrowser ? (
  // @ts-ignore
  !!window.msCrypto
) : false;
var pluginProps = {
  animateFill: false,
  followCursor: false,
  inlinePositioning: false,
  sticky: false
};
var renderProps = {
  allowHTML: false,
  animation: "fade",
  arrow: true,
  content: "",
  inertia: false,
  maxWidth: 350,
  role: "tooltip",
  theme: "",
  zIndex: 9999
};
var defaultProps = Object.assign({
  appendTo: TIPPY_DEFAULT_APPEND_TO,
  aria: {
    content: "auto",
    expanded: "auto"
  },
  delay: 0,
  duration: [300, 250],
  getReferenceClientRect: null,
  hideOnClick: true,
  ignoreAttributes: false,
  interactive: false,
  interactiveBorder: 2,
  interactiveDebounce: 0,
  moveTransition: "",
  offset: [0, 10],
  onAfterUpdate: function onAfterUpdate() {
  },
  onBeforeUpdate: function onBeforeUpdate() {
  },
  onCreate: function onCreate() {
  },
  onDestroy: function onDestroy() {
  },
  onHidden: function onHidden() {
  },
  onHide: function onHide() {
  },
  onMount: function onMount() {
  },
  onShow: function onShow() {
  },
  onShown: function onShown() {
  },
  onTrigger: function onTrigger() {
  },
  onUntrigger: function onUntrigger() {
  },
  onClickOutside: function onClickOutside() {
  },
  placement: "top",
  plugins: [],
  popperOptions: {},
  render: null,
  showOnCreate: false,
  touch: true,
  trigger: "mouseenter focus",
  triggerTarget: null
}, pluginProps, renderProps);
var defaultKeys = Object.keys(defaultProps);
var setDefaultProps = function setDefaultProps2(partialProps) {
  var keys = Object.keys(partialProps);
  keys.forEach(function(key) {
    defaultProps[key] = partialProps[key];
  });
};
function getExtendedPassedProps(passedProps) {
  var plugins = passedProps.plugins || [];
  var pluginProps2 = plugins.reduce(function(acc, plugin) {
    var name = plugin.name, defaultValue = plugin.defaultValue;
    if (name) {
      var _name;
      acc[name] = passedProps[name] !== void 0 ? passedProps[name] : (_name = defaultProps[name]) != null ? _name : defaultValue;
    }
    return acc;
  }, {});
  return Object.assign({}, passedProps, pluginProps2);
}
function getDataAttributeProps(reference2, plugins) {
  var propKeys = plugins ? Object.keys(getExtendedPassedProps(Object.assign({}, defaultProps, {
    plugins
  }))) : defaultKeys;
  var props = propKeys.reduce(function(acc, key) {
    var valueAsString = (reference2.getAttribute("data-tippy-" + key) || "").trim();
    if (!valueAsString) {
      return acc;
    }
    if (key === "content") {
      acc[key] = valueAsString;
    } else {
      try {
        acc[key] = JSON.parse(valueAsString);
      } catch (e) {
        acc[key] = valueAsString;
      }
    }
    return acc;
  }, {});
  return props;
}
function evaluateProps(reference2, props) {
  var out = Object.assign({}, props, {
    content: invokeWithArgsOrReturn(props.content, [reference2])
  }, props.ignoreAttributes ? {} : getDataAttributeProps(reference2, props.plugins));
  out.aria = Object.assign({}, defaultProps.aria, out.aria);
  out.aria = {
    expanded: out.aria.expanded === "auto" ? props.interactive : out.aria.expanded,
    content: out.aria.content === "auto" ? props.interactive ? null : "describedby" : out.aria.content
  };
  return out;
}
var innerHTML = function innerHTML2() {
  return "innerHTML";
};
function dangerouslySetInnerHTML(element2, html2) {
  element2[innerHTML()] = html2;
}
function createArrowElement(value) {
  var arrow2 = div();
  if (value === true) {
    arrow2.className = ARROW_CLASS;
  } else {
    arrow2.className = SVG_ARROW_CLASS;
    if (isElement(value)) {
      arrow2.appendChild(value);
    } else {
      dangerouslySetInnerHTML(arrow2, value);
    }
  }
  return arrow2;
}
function setContent(content, props) {
  if (isElement(props.content)) {
    dangerouslySetInnerHTML(content, "");
    content.appendChild(props.content);
  } else if (typeof props.content !== "function") {
    if (props.allowHTML) {
      dangerouslySetInnerHTML(content, props.content);
    } else {
      content.textContent = props.content;
    }
  }
}
function getChildren(popper2) {
  var box = popper2.firstElementChild;
  var boxChildren = arrayFrom(box.children);
  return {
    box,
    content: boxChildren.find(function(node) {
      return node.classList.contains(CONTENT_CLASS);
    }),
    arrow: boxChildren.find(function(node) {
      return node.classList.contains(ARROW_CLASS) || node.classList.contains(SVG_ARROW_CLASS);
    }),
    backdrop: boxChildren.find(function(node) {
      return node.classList.contains(BACKDROP_CLASS);
    })
  };
}
function render(instance2) {
  var popper2 = div();
  var box = div();
  box.className = BOX_CLASS;
  box.setAttribute("data-state", "hidden");
  box.setAttribute("tabindex", "-1");
  var content = div();
  content.className = CONTENT_CLASS;
  content.setAttribute("data-state", "hidden");
  setContent(content, instance2.props);
  popper2.appendChild(box);
  box.appendChild(content);
  onUpdate(instance2.props, instance2.props);
  function onUpdate(prevProps, nextProps) {
    var _getChildren = getChildren(popper2), box2 = _getChildren.box, content2 = _getChildren.content, arrow2 = _getChildren.arrow;
    if (nextProps.theme) {
      box2.setAttribute("data-theme", nextProps.theme);
    } else {
      box2.removeAttribute("data-theme");
    }
    if (typeof nextProps.animation === "string") {
      box2.setAttribute("data-animation", nextProps.animation);
    } else {
      box2.removeAttribute("data-animation");
    }
    if (nextProps.inertia) {
      box2.setAttribute("data-inertia", "");
    } else {
      box2.removeAttribute("data-inertia");
    }
    box2.style.maxWidth = typeof nextProps.maxWidth === "number" ? nextProps.maxWidth + "px" : nextProps.maxWidth;
    if (nextProps.role) {
      box2.setAttribute("role", nextProps.role);
    } else {
      box2.removeAttribute("role");
    }
    if (prevProps.content !== nextProps.content || prevProps.allowHTML !== nextProps.allowHTML) {
      setContent(content2, instance2.props);
    }
    if (nextProps.arrow) {
      if (!arrow2) {
        box2.appendChild(createArrowElement(nextProps.arrow));
      } else if (prevProps.arrow !== nextProps.arrow) {
        box2.removeChild(arrow2);
        box2.appendChild(createArrowElement(nextProps.arrow));
      }
    } else if (arrow2) {
      box2.removeChild(arrow2);
    }
  }
  return {
    popper: popper2,
    onUpdate
  };
}
render.$$tippy = true;
var idCounter = 1;
var mouseMoveListeners = [];
var mountedInstances = [];
function createTippy(reference2, passedProps) {
  var props = evaluateProps(reference2, Object.assign({}, defaultProps, getExtendedPassedProps(removeUndefinedProps(passedProps))));
  var showTimeout;
  var hideTimeout;
  var scheduleHideAnimationFrame;
  var isVisibleFromClick = false;
  var didHideDueToDocumentMouseDown = false;
  var didTouchMove = false;
  var ignoreOnFirstUpdate = false;
  var lastTriggerEvent;
  var currentTransitionEndListener;
  var onFirstUpdate;
  var listeners = [];
  var debouncedOnMouseMove = debounce(onMouseMove, props.interactiveDebounce);
  var currentTarget;
  var id = idCounter++;
  var popperInstance = null;
  var plugins = unique(props.plugins);
  var state = {
    // Is the instance currently enabled?
    isEnabled: true,
    // Is the tippy currently showing and not transitioning out?
    isVisible: false,
    // Has the instance been destroyed?
    isDestroyed: false,
    // Is the tippy currently mounted to the DOM?
    isMounted: false,
    // Has the tippy finished transitioning in?
    isShown: false
  };
  var instance2 = {
    // properties
    id,
    reference: reference2,
    popper: div(),
    popperInstance,
    props,
    state,
    plugins,
    // methods
    clearDelayTimeouts,
    setProps,
    setContent: setContent2,
    show,
    hide: hide2,
    hideWithInteractivity,
    enable,
    disable,
    unmount,
    destroy
  };
  if (!props.render) {
    return instance2;
  }
  var _props$render = props.render(instance2), popper2 = _props$render.popper, onUpdate = _props$render.onUpdate;
  popper2.setAttribute("data-tippy-root", "");
  popper2.id = "tippy-" + instance2.id;
  instance2.popper = popper2;
  reference2._tippy = instance2;
  popper2._tippy = instance2;
  var pluginsHooks = plugins.map(function(plugin) {
    return plugin.fn(instance2);
  });
  var hasAriaExpanded = reference2.hasAttribute("aria-expanded");
  addListeners();
  handleAriaExpandedAttribute();
  handleStyles();
  invokeHook("onCreate", [instance2]);
  if (props.showOnCreate) {
    scheduleShow();
  }
  popper2.addEventListener("mouseenter", function() {
    if (instance2.props.interactive && instance2.state.isVisible) {
      instance2.clearDelayTimeouts();
    }
  });
  popper2.addEventListener("mouseleave", function() {
    if (instance2.props.interactive && instance2.props.trigger.indexOf("mouseenter") >= 0) {
      getDocument().addEventListener("mousemove", debouncedOnMouseMove);
    }
  });
  return instance2;
  function getNormalizedTouchSettings() {
    var touch = instance2.props.touch;
    return Array.isArray(touch) ? touch : [touch, 0];
  }
  function getIsCustomTouchBehavior() {
    return getNormalizedTouchSettings()[0] === "hold";
  }
  function getIsDefaultRenderFn() {
    var _instance$props$rende;
    return !!((_instance$props$rende = instance2.props.render) != null && _instance$props$rende.$$tippy);
  }
  function getCurrentTarget() {
    return currentTarget || reference2;
  }
  function getDocument() {
    var parent = getCurrentTarget().parentNode;
    return parent ? getOwnerDocument(parent) : document;
  }
  function getDefaultTemplateChildren() {
    return getChildren(popper2);
  }
  function getDelay(isShow) {
    if (instance2.state.isMounted && !instance2.state.isVisible || currentInput.isTouch || lastTriggerEvent && lastTriggerEvent.type === "focus") {
      return 0;
    }
    return getValueAtIndexOrReturn(instance2.props.delay, isShow ? 0 : 1, defaultProps.delay);
  }
  function handleStyles(fromHide) {
    if (fromHide === void 0) {
      fromHide = false;
    }
    popper2.style.pointerEvents = instance2.props.interactive && !fromHide ? "" : "none";
    popper2.style.zIndex = "" + instance2.props.zIndex;
  }
  function invokeHook(hook, args, shouldInvokePropsHook) {
    if (shouldInvokePropsHook === void 0) {
      shouldInvokePropsHook = true;
    }
    pluginsHooks.forEach(function(pluginHooks) {
      if (pluginHooks[hook]) {
        pluginHooks[hook].apply(pluginHooks, args);
      }
    });
    if (shouldInvokePropsHook) {
      var _instance$props;
      (_instance$props = instance2.props)[hook].apply(_instance$props, args);
    }
  }
  function handleAriaContentAttribute() {
    var aria = instance2.props.aria;
    if (!aria.content) {
      return;
    }
    var attr2 = "aria-" + aria.content;
    var id2 = popper2.id;
    var nodes = normalizeToArray(instance2.props.triggerTarget || reference2);
    nodes.forEach(function(node) {
      var currentValue = node.getAttribute(attr2);
      if (instance2.state.isVisible) {
        node.setAttribute(attr2, currentValue ? currentValue + " " + id2 : id2);
      } else {
        var nextValue = currentValue && currentValue.replace(id2, "").trim();
        if (nextValue) {
          node.setAttribute(attr2, nextValue);
        } else {
          node.removeAttribute(attr2);
        }
      }
    });
  }
  function handleAriaExpandedAttribute() {
    if (hasAriaExpanded || !instance2.props.aria.expanded) {
      return;
    }
    var nodes = normalizeToArray(instance2.props.triggerTarget || reference2);
    nodes.forEach(function(node) {
      if (instance2.props.interactive) {
        node.setAttribute("aria-expanded", instance2.state.isVisible && node === getCurrentTarget() ? "true" : "false");
      } else {
        node.removeAttribute("aria-expanded");
      }
    });
  }
  function cleanupInteractiveMouseListeners() {
    getDocument().removeEventListener("mousemove", debouncedOnMouseMove);
    mouseMoveListeners = mouseMoveListeners.filter(function(listener) {
      return listener !== debouncedOnMouseMove;
    });
  }
  function onDocumentPress(event) {
    if (currentInput.isTouch) {
      if (didTouchMove || event.type === "mousedown") {
        return;
      }
    }
    var actualTarget = event.composedPath && event.composedPath()[0] || event.target;
    if (instance2.props.interactive && actualContains(popper2, actualTarget)) {
      return;
    }
    if (normalizeToArray(instance2.props.triggerTarget || reference2).some(function(el) {
      return actualContains(el, actualTarget);
    })) {
      if (currentInput.isTouch) {
        return;
      }
      if (instance2.state.isVisible && instance2.props.trigger.indexOf("click") >= 0) {
        return;
      }
    } else {
      invokeHook("onClickOutside", [instance2, event]);
    }
    if (instance2.props.hideOnClick === true) {
      instance2.clearDelayTimeouts();
      instance2.hide();
      didHideDueToDocumentMouseDown = true;
      setTimeout(function() {
        didHideDueToDocumentMouseDown = false;
      });
      if (!instance2.state.isMounted) {
        removeDocumentPress();
      }
    }
  }
  function onTouchMove() {
    didTouchMove = true;
  }
  function onTouchStart() {
    didTouchMove = false;
  }
  function addDocumentPress() {
    var doc = getDocument();
    doc.addEventListener("mousedown", onDocumentPress, true);
    doc.addEventListener("touchend", onDocumentPress, TOUCH_OPTIONS);
    doc.addEventListener("touchstart", onTouchStart, TOUCH_OPTIONS);
    doc.addEventListener("touchmove", onTouchMove, TOUCH_OPTIONS);
  }
  function removeDocumentPress() {
    var doc = getDocument();
    doc.removeEventListener("mousedown", onDocumentPress, true);
    doc.removeEventListener("touchend", onDocumentPress, TOUCH_OPTIONS);
    doc.removeEventListener("touchstart", onTouchStart, TOUCH_OPTIONS);
    doc.removeEventListener("touchmove", onTouchMove, TOUCH_OPTIONS);
  }
  function onTransitionedOut(duration, callback) {
    onTransitionEnd(duration, function() {
      if (!instance2.state.isVisible && popper2.parentNode && popper2.parentNode.contains(popper2)) {
        callback();
      }
    });
  }
  function onTransitionedIn(duration, callback) {
    onTransitionEnd(duration, callback);
  }
  function onTransitionEnd(duration, callback) {
    var box = getDefaultTemplateChildren().box;
    function listener(event) {
      if (event.target === box) {
        updateTransitionEndListener(box, "remove", listener);
        callback();
      }
    }
    if (duration === 0) {
      return callback();
    }
    updateTransitionEndListener(box, "remove", currentTransitionEndListener);
    updateTransitionEndListener(box, "add", listener);
    currentTransitionEndListener = listener;
  }
  function on(eventType, handler, options) {
    if (options === void 0) {
      options = false;
    }
    var nodes = normalizeToArray(instance2.props.triggerTarget || reference2);
    nodes.forEach(function(node) {
      node.addEventListener(eventType, handler, options);
      listeners.push({
        node,
        eventType,
        handler,
        options
      });
    });
  }
  function addListeners() {
    if (getIsCustomTouchBehavior()) {
      on("touchstart", onTrigger2, {
        passive: true
      });
      on("touchend", onMouseLeave, {
        passive: true
      });
    }
    splitBySpaces(instance2.props.trigger).forEach(function(eventType) {
      if (eventType === "manual") {
        return;
      }
      on(eventType, onTrigger2);
      switch (eventType) {
        case "mouseenter":
          on("mouseleave", onMouseLeave);
          break;
        case "focus":
          on(isIE11 ? "focusout" : "blur", onBlurOrFocusOut);
          break;
        case "focusin":
          on("focusout", onBlurOrFocusOut);
          break;
      }
    });
  }
  function removeListeners() {
    listeners.forEach(function(_ref) {
      var node = _ref.node, eventType = _ref.eventType, handler = _ref.handler, options = _ref.options;
      node.removeEventListener(eventType, handler, options);
    });
    listeners = [];
  }
  function onTrigger2(event) {
    var _lastTriggerEvent;
    var shouldScheduleClickHide = false;
    if (!instance2.state.isEnabled || isEventListenerStopped(event) || didHideDueToDocumentMouseDown) {
      return;
    }
    var wasFocused = ((_lastTriggerEvent = lastTriggerEvent) == null ? void 0 : _lastTriggerEvent.type) === "focus";
    lastTriggerEvent = event;
    currentTarget = event.currentTarget;
    handleAriaExpandedAttribute();
    if (!instance2.state.isVisible && isMouseEvent(event)) {
      mouseMoveListeners.forEach(function(listener) {
        return listener(event);
      });
    }
    if (event.type === "click" && (instance2.props.trigger.indexOf("mouseenter") < 0 || isVisibleFromClick) && instance2.props.hideOnClick !== false && instance2.state.isVisible) {
      shouldScheduleClickHide = true;
    } else {
      scheduleShow(event);
    }
    if (event.type === "click") {
      isVisibleFromClick = !shouldScheduleClickHide;
    }
    if (shouldScheduleClickHide && !wasFocused) {
      scheduleHide(event);
    }
  }
  function onMouseMove(event) {
    var target = event.target;
    var isCursorOverReferenceOrPopper = getCurrentTarget().contains(target) || popper2.contains(target);
    if (event.type === "mousemove" && isCursorOverReferenceOrPopper) {
      return;
    }
    var popperTreeData = getNestedPopperTree().concat(popper2).map(function(popper22) {
      var _instance$popperInsta;
      var instance22 = popper22._tippy;
      var state2 = (_instance$popperInsta = instance22.popperInstance) == null ? void 0 : _instance$popperInsta.state;
      if (state2) {
        return {
          popperRect: popper22.getBoundingClientRect(),
          popperState: state2,
          props
        };
      }
      return null;
    }).filter(Boolean);
    if (isCursorOutsideInteractiveBorder(popperTreeData, event)) {
      cleanupInteractiveMouseListeners();
      scheduleHide(event);
    }
  }
  function onMouseLeave(event) {
    var shouldBail = isEventListenerStopped(event) || instance2.props.trigger.indexOf("click") >= 0 && isVisibleFromClick;
    if (shouldBail) {
      return;
    }
    if (instance2.props.interactive) {
      instance2.hideWithInteractivity(event);
      return;
    }
    scheduleHide(event);
  }
  function onBlurOrFocusOut(event) {
    if (instance2.props.trigger.indexOf("focusin") < 0 && event.target !== getCurrentTarget()) {
      return;
    }
    if (instance2.props.interactive && event.relatedTarget && popper2.contains(event.relatedTarget)) {
      return;
    }
    scheduleHide(event);
  }
  function isEventListenerStopped(event) {
    return currentInput.isTouch ? getIsCustomTouchBehavior() !== event.type.indexOf("touch") >= 0 : false;
  }
  function createPopperInstance() {
    destroyPopperInstance();
    var _instance$props2 = instance2.props, popperOptions = _instance$props2.popperOptions, placement = _instance$props2.placement, offset2 = _instance$props2.offset, getReferenceClientRect = _instance$props2.getReferenceClientRect, moveTransition = _instance$props2.moveTransition;
    var arrow2 = getIsDefaultRenderFn() ? getChildren(popper2).arrow : null;
    var computedReference = getReferenceClientRect ? {
      getBoundingClientRect: getReferenceClientRect,
      contextElement: getReferenceClientRect.contextElement || getCurrentTarget()
    } : reference2;
    var tippyModifier = {
      name: "$$tippy",
      enabled: true,
      phase: "beforeWrite",
      requires: ["computeStyles"],
      fn: function fn5(_ref2) {
        var state2 = _ref2.state;
        if (getIsDefaultRenderFn()) {
          var _getDefaultTemplateCh = getDefaultTemplateChildren(), box = _getDefaultTemplateCh.box;
          ["placement", "reference-hidden", "escaped"].forEach(function(attr2) {
            if (attr2 === "placement") {
              box.setAttribute("data-placement", state2.placement);
            } else {
              if (state2.attributes.popper["data-popper-" + attr2]) {
                box.setAttribute("data-" + attr2, "");
              } else {
                box.removeAttribute("data-" + attr2);
              }
            }
          });
          state2.attributes.popper = {};
        }
      }
    };
    var modifiers = [{
      name: "offset",
      options: {
        offset: offset2
      }
    }, {
      name: "preventOverflow",
      options: {
        padding: {
          top: 2,
          bottom: 2,
          left: 5,
          right: 5
        }
      }
    }, {
      name: "flip",
      options: {
        padding: 5
      }
    }, {
      name: "computeStyles",
      options: {
        adaptive: !moveTransition
      }
    }, tippyModifier];
    if (getIsDefaultRenderFn() && arrow2) {
      modifiers.push({
        name: "arrow",
        options: {
          element: arrow2,
          padding: 3
        }
      });
    }
    modifiers.push.apply(modifiers, (popperOptions == null ? void 0 : popperOptions.modifiers) || []);
    instance2.popperInstance = createPopper(computedReference, popper2, Object.assign({}, popperOptions, {
      placement,
      onFirstUpdate,
      modifiers
    }));
  }
  function destroyPopperInstance() {
    if (instance2.popperInstance) {
      instance2.popperInstance.destroy();
      instance2.popperInstance = null;
    }
  }
  function mount() {
    var appendTo = instance2.props.appendTo;
    var parentNode;
    var node = getCurrentTarget();
    if (instance2.props.interactive && appendTo === TIPPY_DEFAULT_APPEND_TO || appendTo === "parent") {
      parentNode = node.parentNode;
    } else {
      parentNode = invokeWithArgsOrReturn(appendTo, [node]);
    }
    if (!parentNode.contains(popper2)) {
      parentNode.appendChild(popper2);
    }
    instance2.state.isMounted = true;
    createPopperInstance();
  }
  function getNestedPopperTree() {
    return arrayFrom(popper2.querySelectorAll("[data-tippy-root]"));
  }
  function scheduleShow(event) {
    instance2.clearDelayTimeouts();
    if (event) {
      invokeHook("onTrigger", [instance2, event]);
    }
    addDocumentPress();
    var delay = getDelay(true);
    var _getNormalizedTouchSe = getNormalizedTouchSettings(), touchValue = _getNormalizedTouchSe[0], touchDelay = _getNormalizedTouchSe[1];
    if (currentInput.isTouch && touchValue === "hold" && touchDelay) {
      delay = touchDelay;
    }
    if (delay) {
      showTimeout = setTimeout(function() {
        instance2.show();
      }, delay);
    } else {
      instance2.show();
    }
  }
  function scheduleHide(event) {
    instance2.clearDelayTimeouts();
    invokeHook("onUntrigger", [instance2, event]);
    if (!instance2.state.isVisible) {
      removeDocumentPress();
      return;
    }
    if (instance2.props.trigger.indexOf("mouseenter") >= 0 && instance2.props.trigger.indexOf("click") >= 0 && ["mouseleave", "mousemove"].indexOf(event.type) >= 0 && isVisibleFromClick) {
      return;
    }
    var delay = getDelay(false);
    if (delay) {
      hideTimeout = setTimeout(function() {
        if (instance2.state.isVisible) {
          instance2.hide();
        }
      }, delay);
    } else {
      scheduleHideAnimationFrame = requestAnimationFrame(function() {
        instance2.hide();
      });
    }
  }
  function enable() {
    instance2.state.isEnabled = true;
  }
  function disable() {
    instance2.hide();
    instance2.state.isEnabled = false;
  }
  function clearDelayTimeouts() {
    clearTimeout(showTimeout);
    clearTimeout(hideTimeout);
    cancelAnimationFrame(scheduleHideAnimationFrame);
  }
  function setProps(partialProps) {
    if (instance2.state.isDestroyed) {
      return;
    }
    invokeHook("onBeforeUpdate", [instance2, partialProps]);
    removeListeners();
    var prevProps = instance2.props;
    var nextProps = evaluateProps(reference2, Object.assign({}, prevProps, removeUndefinedProps(partialProps), {
      ignoreAttributes: true
    }));
    instance2.props = nextProps;
    addListeners();
    if (prevProps.interactiveDebounce !== nextProps.interactiveDebounce) {
      cleanupInteractiveMouseListeners();
      debouncedOnMouseMove = debounce(onMouseMove, nextProps.interactiveDebounce);
    }
    if (prevProps.triggerTarget && !nextProps.triggerTarget) {
      normalizeToArray(prevProps.triggerTarget).forEach(function(node) {
        node.removeAttribute("aria-expanded");
      });
    } else if (nextProps.triggerTarget) {
      reference2.removeAttribute("aria-expanded");
    }
    handleAriaExpandedAttribute();
    handleStyles();
    if (onUpdate) {
      onUpdate(prevProps, nextProps);
    }
    if (instance2.popperInstance) {
      createPopperInstance();
      getNestedPopperTree().forEach(function(nestedPopper) {
        requestAnimationFrame(nestedPopper._tippy.popperInstance.forceUpdate);
      });
    }
    invokeHook("onAfterUpdate", [instance2, partialProps]);
  }
  function setContent2(content) {
    instance2.setProps({
      content
    });
  }
  function show() {
    var isAlreadyVisible = instance2.state.isVisible;
    var isDestroyed = instance2.state.isDestroyed;
    var isDisabled = !instance2.state.isEnabled;
    var isTouchAndTouchDisabled = currentInput.isTouch && !instance2.props.touch;
    var duration = getValueAtIndexOrReturn(instance2.props.duration, 0, defaultProps.duration);
    if (isAlreadyVisible || isDestroyed || isDisabled || isTouchAndTouchDisabled) {
      return;
    }
    if (getCurrentTarget().hasAttribute("disabled")) {
      return;
    }
    invokeHook("onShow", [instance2], false);
    if (instance2.props.onShow(instance2) === false) {
      return;
    }
    instance2.state.isVisible = true;
    if (getIsDefaultRenderFn()) {
      popper2.style.visibility = "visible";
    }
    handleStyles();
    addDocumentPress();
    if (!instance2.state.isMounted) {
      popper2.style.transition = "none";
    }
    if (getIsDefaultRenderFn()) {
      var _getDefaultTemplateCh2 = getDefaultTemplateChildren(), box = _getDefaultTemplateCh2.box, content = _getDefaultTemplateCh2.content;
      setTransitionDuration([box, content], 0);
    }
    onFirstUpdate = function onFirstUpdate2() {
      var _instance$popperInsta2;
      if (!instance2.state.isVisible || ignoreOnFirstUpdate) {
        return;
      }
      ignoreOnFirstUpdate = true;
      void popper2.offsetHeight;
      popper2.style.transition = instance2.props.moveTransition;
      if (getIsDefaultRenderFn() && instance2.props.animation) {
        var _getDefaultTemplateCh3 = getDefaultTemplateChildren(), _box = _getDefaultTemplateCh3.box, _content = _getDefaultTemplateCh3.content;
        setTransitionDuration([_box, _content], duration);
        setVisibilityState([_box, _content], "visible");
      }
      handleAriaContentAttribute();
      handleAriaExpandedAttribute();
      pushIfUnique(mountedInstances, instance2);
      (_instance$popperInsta2 = instance2.popperInstance) == null ? void 0 : _instance$popperInsta2.forceUpdate();
      invokeHook("onMount", [instance2]);
      if (instance2.props.animation && getIsDefaultRenderFn()) {
        onTransitionedIn(duration, function() {
          instance2.state.isShown = true;
          invokeHook("onShown", [instance2]);
        });
      }
    };
    mount();
  }
  function hide2() {
    var isAlreadyHidden = !instance2.state.isVisible;
    var isDestroyed = instance2.state.isDestroyed;
    var isDisabled = !instance2.state.isEnabled;
    var duration = getValueAtIndexOrReturn(instance2.props.duration, 1, defaultProps.duration);
    if (isAlreadyHidden || isDestroyed || isDisabled) {
      return;
    }
    invokeHook("onHide", [instance2], false);
    if (instance2.props.onHide(instance2) === false) {
      return;
    }
    instance2.state.isVisible = false;
    instance2.state.isShown = false;
    ignoreOnFirstUpdate = false;
    isVisibleFromClick = false;
    if (getIsDefaultRenderFn()) {
      popper2.style.visibility = "hidden";
    }
    cleanupInteractiveMouseListeners();
    removeDocumentPress();
    handleStyles(true);
    if (getIsDefaultRenderFn()) {
      var _getDefaultTemplateCh4 = getDefaultTemplateChildren(), box = _getDefaultTemplateCh4.box, content = _getDefaultTemplateCh4.content;
      if (instance2.props.animation) {
        setTransitionDuration([box, content], duration);
        setVisibilityState([box, content], "hidden");
      }
    }
    handleAriaContentAttribute();
    handleAriaExpandedAttribute();
    if (instance2.props.animation) {
      if (getIsDefaultRenderFn()) {
        onTransitionedOut(duration, instance2.unmount);
      }
    } else {
      instance2.unmount();
    }
  }
  function hideWithInteractivity(event) {
    getDocument().addEventListener("mousemove", debouncedOnMouseMove);
    pushIfUnique(mouseMoveListeners, debouncedOnMouseMove);
    debouncedOnMouseMove(event);
  }
  function unmount() {
    if (instance2.state.isVisible) {
      instance2.hide();
    }
    if (!instance2.state.isMounted) {
      return;
    }
    destroyPopperInstance();
    getNestedPopperTree().forEach(function(nestedPopper) {
      nestedPopper._tippy.unmount();
    });
    if (popper2.parentNode) {
      popper2.parentNode.removeChild(popper2);
    }
    mountedInstances = mountedInstances.filter(function(i) {
      return i !== instance2;
    });
    instance2.state.isMounted = false;
    invokeHook("onHidden", [instance2]);
  }
  function destroy() {
    if (instance2.state.isDestroyed) {
      return;
    }
    instance2.clearDelayTimeouts();
    instance2.unmount();
    removeListeners();
    delete reference2._tippy;
    instance2.state.isDestroyed = true;
    invokeHook("onDestroy", [instance2]);
  }
}
function tippy(targets, optionalProps) {
  if (optionalProps === void 0) {
    optionalProps = {};
  }
  var plugins = defaultProps.plugins.concat(optionalProps.plugins || []);
  bindGlobalEventListeners();
  var passedProps = Object.assign({}, optionalProps, {
    plugins
  });
  var elements = getArrayOfElements(targets);
  var instances = elements.reduce(function(acc, reference2) {
    var instance2 = reference2 && createTippy(reference2, passedProps);
    if (instance2) {
      acc.push(instance2);
    }
    return acc;
  }, []);
  return isElement(targets) ? instances[0] : instances;
}
tippy.defaultProps = defaultProps;
tippy.setDefaultProps = setDefaultProps;
tippy.currentInput = currentInput;
Object.assign({}, applyStyles$1, {
  effect: function effect2(_ref) {
    var state = _ref.state;
    var initialStyles = {
      popper: {
        position: state.options.strategy,
        left: "0",
        top: "0",
        margin: "0"
      },
      arrow: {
        position: "absolute"
      },
      reference: {}
    };
    Object.assign(state.elements.popper.style, initialStyles.popper);
    state.styles = initialStyles;
    if (state.elements.arrow) {
      Object.assign(state.elements.arrow.style, initialStyles.arrow);
    }
  }
});
tippy.setDefaultProps({
  render
});
document.querySelector("[data-fls-tippy-content]") ? tippy("[data-fls-tippy-content]", {
  allowHTML: true,
  content(reference2) {
    return reference2.getAttribute("data-fls-tippy-content");
  }
}) : null;
document.querySelector("[data-fls-tippy]") ? tippy("[data-fls-tippy]", {
  allowHTML: true,
  // interactive: true,
  interactive: false,
  hideOnClick: true,
  appendTo: () => document.body,
  maxWidth: "none",
  content(reference2) {
    const src = reference2.getAttribute("data-video-src");
    return `
        <video
          src="${src}"
          muted autoplay loop playsinline preload="none"
          style="display:block;width:100%;height:auto;object-fit:cover">
        </video>
      `;
  },
  onShow(instance2) {
    const v = instance2.popper.querySelector("video");
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {
      });
    }
  },
  onHide(instance2) {
    const v = instance2.popper.querySelector("video");
    if (v) v.pause();
  }
}) : null;
document.querySelector("[data-fls-tippy-img]") ? tippy("[data-fls-tippy-img]", {
  allowHTML: true,
  // interactive: true,
  interactive: false,
  hideOnClick: true,
  appendTo: () => document.body,
  maxWidth: "none",
  content(reference2) {
    const src = reference2.getAttribute("data-image-src");
    const alt = reference2.getAttribute("data-image-alt") || "";
    return `
        <div class="tippy-image">
          <img src="${src}" alt="${alt}" loading="lazy" decoding="async">
        </div>
      `;
  }
}) : null;
function pageNavigation() {
  document.addEventListener("click", pageNavigationAction);
  document.addEventListener("watcherCallback", pageNavigationAction);
  function pageNavigationAction(e) {
    if (e.type === "click") {
      const targetElement = e.target;
      if (targetElement.closest("[data-fls-scrollto]")) {
        const gotoLink = targetElement.closest("[data-fls-scrollto]");
        const gotoLinkSelector = gotoLink.dataset.flsScrollto ? gotoLink.dataset.flsScrollto : "";
        const noHeader = gotoLink.hasAttribute("data-fls-scrollto-header") ? true : false;
        const gotoSpeed = gotoLink.dataset.flsScrolltoSpeed ? gotoLink.dataset.flsScrolltoSpeed : 500;
        const offsetTop = gotoLink.dataset.flsScrolltoTop ? parseInt(gotoLink.dataset.flsScrolltoTop) : 0;
        if (window.fullpage) {
          const fullpageSection = document.querySelector(`${gotoLinkSelector}`).closest("[data-fls-fullpage-section]");
          const fullpageSectionId = fullpageSection ? +fullpageSection.dataset.flsFullpageId : null;
          if (fullpageSectionId !== null) {
            window.fullpage.switchingSection(fullpageSectionId);
            if (document.documentElement.hasAttribute("data-fls-menu-open")) {
              bodyUnlock();
              document.documentElement.removeAttribute("data-fls-menu-open");
            }
          }
        } else {
          gotoBlock(gotoLinkSelector, noHeader, gotoSpeed, offsetTop);
        }
        e.preventDefault();
      }
    } else if (e.type === "watcherCallback" && e.detail) {
      const entry = e.detail.entry;
      const targetElement = entry.target;
      if (targetElement.dataset.flsWatcher === "navigator") {
        document.querySelector(`[data-fls-scrollto].--navigator-active`);
        let navigatorCurrentItem;
        if (targetElement.id && document.querySelector(`[data-fls-scrollto="#${targetElement.id}"]`)) {
          navigatorCurrentItem = document.querySelector(`[data-fls-scrollto="#${targetElement.id}"]`);
        } else if (targetElement.classList.length) {
          for (let index = 0; index < targetElement.classList.length; index++) {
            const element2 = targetElement.classList[index];
            if (document.querySelector(`[data-fls-scrollto=".${element2}"]`)) {
              navigatorCurrentItem = document.querySelector(`[data-fls-scrollto=".${element2}"]`);
              break;
            }
          }
        }
        if (entry.isIntersecting) {
          navigatorCurrentItem ? navigatorCurrentItem.classList.add("--navigator-active") : null;
        } else {
          navigatorCurrentItem ? navigatorCurrentItem.classList.remove("--navigator-active") : null;
        }
      }
    }
  }
  if (getHash()) {
    let goToHash;
    if (document.querySelector(`#${getHash()}`)) {
      goToHash = `#${getHash()}`;
    } else if (document.querySelector(`.${getHash()}`)) {
      goToHash = `.${getHash()}`;
    }
    goToHash ? gotoBlock(goToHash) : null;
  }
}
function initCopyLinksSimple() {
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".link-page");
    if (!btn) return;
    const section = btn.closest(".content-single__item[id]");
    if (!section) return;
    const hash2 = section.id;
    const url = `${location.origin}${location.pathname}${location.search}#${encodeURIComponent(hash2)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    history.replaceState(null, "", url);
    btn.classList.add("is-copied");
    setTimeout(() => btn.classList.remove("is-copied"), 1e3);
  });
}
function scrollFromHashSimple() {
  if (!location.hash) return;
  const id = decodeURIComponent(location.hash).replace(/^#/, "");
  const target = document.getElementById(id);
  if (!target) return;
  history.replaceState(null, "", location.pathname + location.search);
  window.scrollTo(0, 0);
  setTimeout(() => {
    gotoBlock(`#${id}`, false, 500, 0);
  }, 500);
}
window.addEventListener("load", () => {
  initCopyLinksSimple();
  scrollFromHashSimple();
});
document.querySelector("[data-fls-scrollto]") ? window.addEventListener("load", pageNavigation) : null;
(() => {
  const GROUP_ACTIVE = "--navigator-active";
  const navs = Array.from(document.querySelectorAll(".single__navigation"));
  if (!navs.length) return;
  const idOnly = (sel = "") => (sel.match(/^#[\w-]+/) || [null])[0];
  const headerHeight = () => {
    const h = document.querySelector('.ed-header.sticky, .ed-header, header[role="banner"]');
    return h ? h.getBoundingClientRect().height || 0 : 0;
  };
  const openGroup = (h3) => {
    const ul = h3?.nextElementSibling;
    if (!ul) return;
    if (getComputedStyle(ul).maxHeight === "none") return;
    ul.style.maxHeight = ul.scrollHeight + "px";
    const onEnd = (e) => {
      if (e.propertyName !== "max-height") return;
      ul.removeEventListener("transitionend", onEnd);
      ul.style.maxHeight = "none";
    };
    ul.addEventListener("transitionend", onEnd);
  };
  const closeGroup = (h3) => {
    const ul = h3?.nextElementSibling;
    if (!ul) return;
    if (getComputedStyle(ul).maxHeight === "none") {
      ul.style.maxHeight = ul.scrollHeight + "px";
      ul.getBoundingClientRect();
    }
    ul.style.maxHeight = "0px";
  };
  const initOneNav = (navEl) => {
    const container = navEl.previousElementSibling?.classList.contains("content-single") ? navEl.previousElementSibling : null;
    if (!container) return;
    const groupHeads = Array.from(navEl.querySelectorAll("h3[data-fls-scrollto]"));
    const links = Array.from(navEl.querySelectorAll("a[data-fls-scrollto]"));
    const sectionEls = Array.from(container.querySelectorAll(".content-single__item[id]"));
    const sectionToGroup = /* @__PURE__ */ new Map();
    const groupToSection = /* @__PURE__ */ new Map();
    groupHeads.forEach((h3) => {
      const sel = idOnly(h3.getAttribute("data-fls-scrollto") || "");
      const sec = sel && container.querySelector(sel);
      if (sec) {
        sectionToGroup.set(sec, h3);
        groupToSection.set(h3, sec);
      }
    });
    groupHeads.forEach((h3) => {
      const ul = h3.nextElementSibling;
      if (!ul) return;
      if (h3.classList.contains(GROUP_ACTIVE)) ul.style.maxHeight = "none";
      else ul.style.maxHeight = "0px";
    });
    let activeGroup = null;
    const deactivateAll = () => {
      groupHeads.forEach(closeGroup);
      groupHeads.forEach((h) => h.classList.remove(GROUP_ACTIVE));
      activeGroup = null;
    };
    const activate = (h3) => {
      if (!h3 || h3 === activeGroup) return;
      groupHeads.forEach((h) => {
        if (h !== h3) {
          h.classList.remove(GROUP_ACTIVE);
          closeGroup(h);
        }
      });
      h3.classList.add(GROUP_ACTIVE);
      openGroup(h3);
      activeGroup = h3;
    };
    let scrollLockUntil = 0;
    const scrollToEl = (target, baseEl) => {
      const extraTop = parseFloat(baseEl?.getAttribute("data-fls-scrollto-top") || "0") || 0;
      const considerHeader = baseEl?.hasAttribute("data-fls-scrollto-header");
      const offset2 = (considerHeader ? headerHeight() : 0) + extraTop;
      const rect = target.getBoundingClientRect();
      const top2 = window.pageYOffset + rect.top - offset2;
      scrollLockUntil = performance.now() + 800;
      window.scrollTo({ top: top2, behavior: "smooth" });
    };
    groupHeads.forEach((h3) => {
      h3.style.cursor = "pointer";
      h3.addEventListener("click", (e) => {
        e.preventDefault();
        const sec = groupToSection.get(h3);
        if (sec) {
          scrollToEl(sec, h3);
          activate(h3);
        } else {
          if (h3.classList.contains(GROUP_ACTIVE)) {
            h3.classList.remove(GROUP_ACTIVE);
            closeGroup(h3);
            activeGroup = null;
          } else {
            activate(h3);
          }
        }
      });
    });
    links.forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const sel = a.getAttribute("data-fls-scrollto");
        if (!sel) return;
        const target = container.querySelector(sel);
        if (!target) return;
        scrollToEl(target, a);
        const sec = container.querySelector(idOnly(sel) || "");
        const h3 = sec && sectionToGroup.get(sec);
        if (h3) activate(h3);
      });
    });
    const pickCurrentSection = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const topGuide = headerHeight() + 20;
      let candidate = null;
      let bestDist = Infinity;
      for (const sec of sectionEls) {
        const r = sec.getBoundingClientRect();
        const fullyOut = r.bottom <= 0 || r.top >= vh;
        if (fullyOut) continue;
        const dist = Math.abs(r.top - topGuide);
        if (dist < bestDist) {
          bestDist = dist;
          candidate = sec;
        }
      }
      return candidate;
    };
    const onScrollOrResize = () => {
      if (performance.now() < scrollLockUntil) return;
      const cur = pickCurrentSection();
      if (!cur) {
        deactivateAll();
        return;
      }
      const h3 = sectionToGroup.get(cur);
      if (h3) activate(h3);
    };
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", () => {
      if (activeGroup) {
        const ul = activeGroup.nextElementSibling;
        if (ul && getComputedStyle(ul).maxHeight !== "none") {
          ul.style.maxHeight = ul.scrollHeight + "px";
        }
      }
      onScrollOrResize();
    });
    onScrollOrResize();
  };
  navs.forEach(initOneNav);
})();
const htmlEl = document.documentElement;
(() => {
  document.querySelectorAll(".header__search-block.search-block").forEach((block) => {
    const searchBtn = block.querySelector(".search-block__btn");
    const input = block.querySelector('input[name="search"]');
    if (searchBtn) {
      searchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const opened = htmlEl.classList.toggle("search-open");
        if (opened && input) {
          input.focus();
        } else {
          block.classList.remove("search-focus");
        }
      });
    }
    if (input) {
      const syncFocusClass = () => {
        const hasText = input.value.trim().length > 0;
        block.classList.toggle("search-focus", hasText);
      };
      input.addEventListener("input", syncFocusClass);
      input.addEventListener("change", syncFocusClass);
      syncFocusClass();
    }
  });
  document.addEventListener("click", (e) => {
    const clickInsideBody = e.target.closest(".search-block__body");
    const clickOnBtn = e.target.closest(".search-block__btn");
    if (htmlEl.classList.contains("search-open") && !clickInsideBody && !clickOnBtn) {
      htmlEl.classList.remove("search-open");
      document.querySelectorAll(".header__search-block.search-block").forEach((b) => b.classList.remove("search-focus"));
    }
  });
})();
(() => {
  const filterEl = document.querySelector(".header__filter.filter-header");
  if (!filterEl) return;
  const filterBtn = filterEl.querySelector(".filter-header__btn");
  const filterWrapper = filterEl.querySelector(".filter-header__wrapper");
  if (filterBtn) {
    filterBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const opened = htmlEl.classList.toggle("filter-open");
      if (opened) {
        const firstFocusable = filterWrapper?.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
        firstFocusable?.focus();
      }
    });
  }
  document.addEventListener("click", (e) => {
    const clickInside = e.target.closest(".filter-header__wrapper");
    const clickOnBtn = e.target.closest(".filter-header__btn");
    if (htmlEl.classList.contains("filter-open") && !clickInside && !clickOnBtn) {
      htmlEl.classList.remove("filter-open");
    }
  });
})();
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (htmlEl.classList.contains("search-open")) {
      htmlEl.classList.remove("search-open");
      document.querySelectorAll(".header__search-block.search-block").forEach((b) => b.classList.remove("search-focus"));
    }
    if (htmlEl.classList.contains("filter-open")) {
      htmlEl.classList.remove("filter-open");
    }
  }
});
async function copyToClipboard(text2) {
  try {
    await navigator.clipboard.writeText(text2);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text2;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}
function flashCopiedTooltip(el, { text: text2 = "Copied", ms = 1e3 } = {}) {
  const hasAttr = el.hasAttribute("data-fls-tippy-content");
  const prev = hasAttr ? el.getAttribute("data-fls-tippy-content") : null;
  el.setAttribute("data-fls-tippy-content", text2);
  if (el._tippy) {
    const inst = el._tippy;
    inst.setContent(text2);
    inst.show();
    setTimeout(() => {
      if (prev !== null) {
        el.setAttribute("data-fls-tippy-content", prev);
        inst.setContent(prev);
      } else el.removeAttribute("data-fls-tippy-content");
      inst.hide();
    }, ms);
  } else {
    setTimeout(() => {
      if (prev !== null) el.setAttribute("data-fls-tippy-content", prev);
      else el.removeAttribute("data-fls-tippy-content");
    }, ms);
  }
}
function resolveLinkPageURL(btn) {
  const articleLink = btn.closest("a.post-block__article[href]");
  if (articleLink) {
    return articleLink.getAttribute("href");
  }
  const section = btn.closest(".content-single__item[id]");
  if (section) {
    const id = section.id;
    return `${location.origin}${location.pathname}${location.search}#${encodeURIComponent(id)}`;
  }
  return null;
}
function initGlobalLinkPageCopy() {
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".link-page");
    if (!btn) return;
    if (btn.closest("a")) {
      e.preventDefault();
      e.stopPropagation();
    }
    const url = resolveLinkPageURL(btn);
    if (!url) return;
    await copyToClipboard(url);
    if (btn.closest(".content-single__item[id]")) {
      history.replaceState(null, "", url);
    }
    flashCopiedTooltip(btn, { text: "Copied", ms: 1e3 });
    btn.classList.add("is-copied");
    setTimeout(() => btn.classList.remove("is-copied"), 1e3);
  });
}
initGlobalLinkPageCopy();
function spollers() {
  const spollersArray = document.querySelectorAll("[data-fls-spollers]");
  if (!spollersArray.length) return;
  document.addEventListener("click", setSpollerAction);
  const spollersRegular = Array.from(spollersArray).filter((item) => !item.dataset.flsSpollers.split(",")[0]);
  if (spollersRegular.length) initSpollers(spollersRegular);
  const mdQueriesArray = dataMediaQueries(spollersArray, "flsSpollers");
  if (mdQueriesArray && mdQueriesArray.length) {
    mdQueriesArray.forEach((mdItem) => {
      mdItem.matchMedia.addEventListener("change", () => initSpollers(mdItem.itemsArray, mdItem.matchMedia));
      initSpollers(mdItem.itemsArray, mdItem.matchMedia);
    });
  }
  function initSpollers(spollersArray2, matchMedia2 = false) {
    spollersArray2.forEach((spollersBlockRaw) => {
      const spollersBlock = matchMedia2 ? spollersBlockRaw.item : spollersBlockRaw;
      if (matchMedia2?.matches || !matchMedia2) {
        spollersBlock.classList.add("--spoller-init");
        initSpollerBody(spollersBlock);
      } else {
        spollersBlock.classList.remove("--spoller-init");
        initSpollerBody(spollersBlock, false);
      }
    });
    document.dispatchEvent(new CustomEvent("fls:spollers-inited"));
  }
  function initSpollerBody(spollersBlock, hideSpollerBody = true) {
    const spollerItems = spollersBlock.querySelectorAll("details");
    if (!spollerItems.length) return;
    spollerItems.forEach((spollerItem) => {
      const spollerTitle = spollerItem.querySelector("summary");
      if (!spollerTitle) return;
      if (hideSpollerBody) {
        spollerTitle.removeAttribute("tabindex");
        if (!spollerItem.hasAttribute("data-fls-spollers-open")) {
          spollerItem.open = false;
          spollerTitle.nextElementSibling.hidden = true;
        } else {
          spollerTitle.classList.add("--spoller-active");
          spollerItem.open = true;
        }
      } else {
        spollerTitle.setAttribute("tabindex", "-1");
        spollerTitle.classList.remove("--spoller-active");
        spollerItem.open = true;
        spollerTitle.nextElementSibling.hidden = false;
      }
    });
  }
  function setSpollerAction(e) {
    const el = e.target;
    if (el.closest("summary") && el.closest("[data-fls-spollers]")) {
      e.preventDefault();
      const spollersRoot = el.closest("[data-fls-spollers]");
      if (!spollersRoot.classList.contains("--spoller-init")) return;
      const spollerTitle = el.closest("summary");
      const details = spollerTitle.closest("details");
      const oneSpoller = spollersRoot.hasAttribute("data-fls-spollers-one");
      const scrollSpoller = details.hasAttribute("data-fls-spollers-scroll");
      const spollerSpeed = spollersRoot.dataset.flsSpollersSpeed ? parseInt(spollersRoot.dataset.flsSpollersSpeed) : 500;
      if (!spollersRoot.querySelectorAll(".--slide").length) {
        if (oneSpoller && !details.open) hideSpollersBody(spollersRoot);
        !details.open ? details.open = true : setTimeout(() => {
          details.open = false;
        }, spollerSpeed);
        spollerTitle.classList.toggle("--spoller-active");
        slideToggle(spollerTitle.nextElementSibling, spollerSpeed);
        if (scrollSpoller && spollerTitle.classList.contains("--spoller-active")) {
          const scrollSpollerValue = details.dataset.flsSpollersScroll;
          const scrollSpollerOffset = +scrollSpollerValue ? +scrollSpollerValue : 0;
          const scrollSpollerNoHeader = details.hasAttribute("data-fls-spollers-scroll-noheader") ? document.querySelector(".header")?.offsetHeight || 0 : 0;
          window.scrollTo({ top: details.offsetTop - (scrollSpollerOffset + scrollSpollerNoHeader), behavior: "smooth" });
        }
      }
    }
    if (!el.closest("[data-fls-spollers]")) {
      const spollersClose = document.querySelectorAll("[data-fls-spollers-close]");
      if (!spollersClose.length) return;
      spollersClose.forEach((spollerClose) => {
        const spollersBlock = spollerClose.closest("[data-fls-spollers]");
        const spollerCloseBlock = spollerClose.parentNode;
        if (spollersBlock.classList.contains("--spoller-init")) {
          const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
          spollerClose.classList.remove("--spoller-active");
          slideUp(spollerClose.nextElementSibling, spollerSpeed);
          setTimeout(() => {
            spollerCloseBlock.open = false;
          }, spollerSpeed);
        }
      });
    }
  }
  function hideSpollersBody(spollersBlock) {
    const opened = spollersBlock.querySelector("details[open]");
    if (!opened || spollersBlock.querySelectorAll(".--slide").length) return;
    const title = opened.querySelector("summary");
    const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
    title.classList.remove("--spoller-active");
    slideUp(title.nextElementSibling, spollerSpeed);
    setTimeout(() => {
      opened.open = false;
    }, spollerSpeed);
  }
}
window.addEventListener("load", spollers);
function initCatalogToggle$1() {
  const btn = document.querySelector(".catalog__close-tabs");
  if (!btn) return;
  const scope = document.querySelector(".catalog__spollers") || document;
  const computeNext = () => !!scope.querySelector("[data-fls-spollers].--spoller-init details:not([open])");
  let nextIsExpand = computeNext();
  const setBtnState = () => {
    btn.textContent = nextIsExpand ? "Expand all" : "Collapse all";
    btn.classList.toggle("--active", !nextIsExpand);
  };
  const toggleAll = () => {
    const blocks = scope.querySelectorAll("[data-fls-spollers].--spoller-init");
    blocks.forEach((spollersBlock) => {
      const speed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
      spollersBlock.querySelectorAll("details").forEach((detailsEl) => {
        const summary = detailsEl.querySelector("summary");
        const body = summary?.nextElementSibling;
        if (!summary || !body) return;
        if (body.classList.contains("--slide")) return;
        if (nextIsExpand) {
          detailsEl.open = true;
          summary.classList.add("--spoller-active");
          if (body.hidden) body.hidden = false;
          slideDown(body, speed);
        } else {
          summary.classList.remove("--spoller-active");
          slideUp(body, speed);
          setTimeout(() => {
            detailsEl.open = false;
          }, speed);
        }
      });
    });
  };
  setBtnState();
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleAll();
    nextIsExpand = !nextIsExpand;
    setBtnState();
  });
}
window.addEventListener("load", initCatalogToggle$1);
document.addEventListener("fls:spollers-reinit", () => {
  spollers();
});
function noop() {
}
function run(fn2) {
  return fn2();
}
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || a && typeof a === "object" || typeof a === "function";
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    for (const callback of callbacks) {
      callback(void 0);
    }
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
const is_client = typeof window !== "undefined";
let now = is_client ? () => window.performance.now() : () => Date.now();
let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;
const tasks = /* @__PURE__ */ new Set();
function run_tasks(now2) {
  tasks.forEach((task) => {
    if (!task.c(now2)) {
      tasks.delete(task);
      task.f();
    }
  });
  if (tasks.size !== 0) raf(run_tasks);
}
function loop(callback) {
  let task;
  if (tasks.size === 0) raf(run_tasks);
  return {
    promise: new Promise((fulfill) => {
      tasks.add(task = { c: callback, f: fulfill });
    }),
    abort() {
      tasks.delete(task);
    }
  };
}
function append(target, node) {
  target.appendChild(node);
}
function append_styles(target, style_sheet_id, styles) {
  const append_styles_to = get_root_for_style(target);
  if (!append_styles_to.getElementById(style_sheet_id)) {
    const style = element("style");
    style.id = style_sheet_id;
    style.textContent = styles;
    append_stylesheet(append_styles_to, style);
  }
}
function get_root_for_style(node) {
  if (!node) return document;
  const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
  if (root && /** @type {ShadowRoot} */
  root.host) {
    return (
      /** @type {ShadowRoot} */
      root
    );
  }
  return node.ownerDocument;
}
function append_stylesheet(node, style) {
  append(
    /** @type {Document} */
    node.head || node,
    style
  );
  return style.sheet;
}
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
function detach(node) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}
function destroy_each(iterations, detaching) {
  for (let i = 0; i < iterations.length; i += 1) {
    if (iterations[i]) iterations[i].d(detaching);
  }
}
function element(name) {
  return document.createElement(name);
}
function svg_element(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}
function text(data) {
  return document.createTextNode(data);
}
function space() {
  return text(" ");
}
function empty() {
  return text("");
}
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
function prevent_default(fn2) {
  return function(event) {
    event.preventDefault();
    return fn2.call(this, event);
  };
}
function attr(node, attribute, value) {
  if (value == null) node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
}
function children(element2) {
  return Array.from(element2.childNodes);
}
function set_data(text2, data) {
  data = "" + data;
  if (text2.data === data) return;
  text2.data = /** @type {string} */
  data;
}
function toggle_class(element2, name, toggle) {
  element2.classList.toggle(name, !!toggle);
}
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
  return new CustomEvent(type, { detail, bubbles, cancelable });
}
class HtmlTag {
  /**
   * @private
   * @default false
   */
  is_svg = false;
  /** parent for creating node */
  e = void 0;
  /** html tag nodes */
  n = void 0;
  /** target */
  t = void 0;
  /** anchor */
  a = void 0;
  constructor(is_svg = false) {
    this.is_svg = is_svg;
    this.e = this.n = null;
  }
  /**
   * @param {string} html
   * @returns {void}
   */
  c(html2) {
    this.h(html2);
  }
  /**
   * @param {string} html
   * @param {HTMLElement | SVGElement} target
   * @param {HTMLElement | SVGElement} anchor
   * @returns {void}
   */
  m(html2, target, anchor = null) {
    if (!this.e) {
      if (this.is_svg)
        this.e = svg_element(
          /** @type {keyof SVGElementTagNameMap} */
          target.nodeName
        );
      else
        this.e = element(
          /** @type {keyof HTMLElementTagNameMap} */
          target.nodeType === 11 ? "TEMPLATE" : target.nodeName
        );
      this.t = target.tagName !== "TEMPLATE" ? target : (
        /** @type {HTMLTemplateElement} */
        target.content
      );
      this.c(html2);
    }
    this.i(anchor);
  }
  /**
   * @param {string} html
   * @returns {void}
   */
  h(html2) {
    this.e.innerHTML = html2;
    this.n = Array.from(
      this.e.nodeName === "TEMPLATE" ? this.e.content.childNodes : this.e.childNodes
    );
  }
  /**
   * @returns {void} */
  i(anchor) {
    for (let i = 0; i < this.n.length; i += 1) {
      insert(this.t, this.n[i], anchor);
    }
  }
  /**
   * @param {string} html
   * @returns {void}
   */
  p(html2) {
    this.d();
    this.h(html2);
    this.i(this.a);
  }
  /**
   * @returns {void} */
  d() {
    this.n.forEach(detach);
  }
}
function get_custom_elements_slots(element2) {
  const result = {};
  element2.childNodes.forEach(
    /** @param {Element} node */
    (node) => {
      result[node.slot || "default"] = true;
    }
  );
  return result;
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component) throw new Error("Function called outside component initialization");
  return current_component;
}
function onMount2(fn2) {
  get_current_component().$$.on_mount.push(fn2);
}
function createEventDispatcher() {
  const component = get_current_component();
  return (type, detail, { cancelable = false } = {}) => {
    const callbacks = component.$$.callbacks[type];
    if (callbacks) {
      const event = custom_event(
        /** @type {string} */
        type,
        detail,
        { cancelable }
      );
      callbacks.slice().forEach((fn2) => {
        fn2.call(component, event);
      });
      return !event.defaultPrevented;
    }
    return true;
  };
}
const dirty_components = [];
const binding_callbacks = [];
let render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = /* @__PURE__ */ Promise.resolve();
let update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function add_render_callback(fn2) {
  render_callbacks.push(fn2);
}
const seen_callbacks = /* @__PURE__ */ new Set();
let flushidx = 0;
function flush() {
  if (flushidx !== 0) {
    return;
  }
  const saved_component = current_component;
  do {
    try {
      while (flushidx < dirty_components.length) {
        const component = dirty_components[flushidx];
        flushidx++;
        set_current_component(component);
        update(component.$$);
      }
    } catch (e) {
      dirty_components.length = 0;
      flushidx = 0;
      throw e;
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length) binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
function flush_render_callbacks(fns) {
  const filtered = [];
  const targets = [];
  render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
  targets.forEach((c) => c());
  render_callbacks = filtered;
}
const outroing = /* @__PURE__ */ new Set();
let outros;
function group_outros() {
  outros = {
    r: 0,
    c: [],
    p: outros
    // parent group
  };
}
function check_outros() {
  if (!outros.r) {
    run_all(outros.c);
  }
  outros = outros.p;
}
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
function transition_out(block, local, detach2, callback) {
  if (block && block.o) {
    if (outroing.has(block)) return;
    outroing.add(block);
    outros.c.push(() => {
      outroing.delete(block);
      if (callback) {
        if (detach2) block.d(1);
        callback();
      }
    });
    block.o(local);
  } else if (callback) {
    callback();
  }
}
function ensure_array_like(array_like_or_iterator) {
  return array_like_or_iterator?.length !== void 0 ? array_like_or_iterator : Array.from(array_like_or_iterator);
}
function create_component(block) {
  block && block.c();
}
function mount_component(component, target, anchor) {
  const { fragment, after_update } = component.$$;
  fragment && fragment.m(target, anchor);
  add_render_callback(() => {
    const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
    if (component.$$.on_destroy) {
      component.$$.on_destroy.push(...new_on_destroy);
    } else {
      run_all(new_on_destroy);
    }
    component.$$.on_mount = [];
  });
  after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    flush_render_callbacks($$.after_update);
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
function init(component, options, instance2, create_fragment2, not_equal, props, append_styles2 = null, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: [],
    // state
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    // lifecycle
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    // everything else
    callbacks: blank_object(),
    dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles2 && append_styles2($$.root);
  let ready = false;
  $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
      if (ready) make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro) transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor);
    flush();
  }
  set_current_component(parent_component);
}
let SvelteElement;
if (typeof HTMLElement === "function") {
  SvelteElement = class extends HTMLElement {
    /** The Svelte component constructor */
    $$ctor;
    /** Slots */
    $$s;
    /** The Svelte component instance */
    $$c;
    /** Whether or not the custom element is connected */
    $$cn = false;
    /** Component props data */
    $$d = {};
    /** `true` if currently in the process of reflecting component props back to attributes */
    $$r = false;
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    $$p_d = {};
    /** @type {Record<string, Function[]>} Event listeners */
    $$l = {};
    /** @type {Map<Function, Function>} Event listener unsubscribe functions */
    $$l_u = /* @__PURE__ */ new Map();
    constructor($$componentCtor, $$slots, use_shadow_dom) {
      super();
      this.$$ctor = $$componentCtor;
      this.$$s = $$slots;
      if (use_shadow_dom) {
        this.attachShadow({ mode: "open" });
      }
    }
    addEventListener(type, listener, options) {
      this.$$l[type] = this.$$l[type] || [];
      this.$$l[type].push(listener);
      if (this.$$c) {
        const unsub = this.$$c.$on(type, listener);
        this.$$l_u.set(listener, unsub);
      }
      super.addEventListener(type, listener, options);
    }
    removeEventListener(type, listener, options) {
      super.removeEventListener(type, listener, options);
      if (this.$$c) {
        const unsub = this.$$l_u.get(listener);
        if (unsub) {
          unsub();
          this.$$l_u.delete(listener);
        }
      }
      if (this.$$l[type]) {
        const idx = this.$$l[type].indexOf(listener);
        if (idx >= 0) {
          this.$$l[type].splice(idx, 1);
        }
      }
    }
    async connectedCallback() {
      this.$$cn = true;
      if (!this.$$c) {
        let create_slot2 = function(name) {
          return () => {
            let node;
            const obj = {
              c: function create() {
                node = element("slot");
                if (name !== "default") {
                  attr(node, "name", name);
                }
              },
              /**
               * @param {HTMLElement} target
               * @param {HTMLElement} [anchor]
               */
              m: function mount(target, anchor) {
                insert(target, node, anchor);
              },
              d: function destroy(detaching) {
                if (detaching) {
                  detach(node);
                }
              }
            };
            return obj;
          };
        };
        var create_slot = create_slot2;
        await Promise.resolve();
        if (!this.$$cn || this.$$c) {
          return;
        }
        const $$slots = {};
        const existing_slots = get_custom_elements_slots(this);
        for (const name of this.$$s) {
          if (name in existing_slots) {
            $$slots[name] = [create_slot2(name)];
          }
        }
        for (const attribute of this.attributes) {
          const name = this.$$g_p(attribute.name);
          if (!(name in this.$$d)) {
            this.$$d[name] = get_custom_element_value(name, attribute.value, this.$$p_d, "toProp");
          }
        }
        for (const key in this.$$p_d) {
          if (!(key in this.$$d) && this[key] !== void 0) {
            this.$$d[key] = this[key];
            delete this[key];
          }
        }
        this.$$c = new this.$$ctor({
          target: this.shadowRoot || this,
          props: {
            ...this.$$d,
            $$slots,
            $$scope: {
              ctx: []
            }
          }
        });
        const reflect_attributes = () => {
          this.$$r = true;
          for (const key in this.$$p_d) {
            this.$$d[key] = this.$$c.$$.ctx[this.$$c.$$.props[key]];
            if (this.$$p_d[key].reflect) {
              const attribute_value = get_custom_element_value(
                key,
                this.$$d[key],
                this.$$p_d,
                "toAttribute"
              );
              if (attribute_value == null) {
                this.removeAttribute(this.$$p_d[key].attribute || key);
              } else {
                this.setAttribute(this.$$p_d[key].attribute || key, attribute_value);
              }
            }
          }
          this.$$r = false;
        };
        this.$$c.$$.after_update.push(reflect_attributes);
        reflect_attributes();
        for (const type in this.$$l) {
          for (const listener of this.$$l[type]) {
            const unsub = this.$$c.$on(type, listener);
            this.$$l_u.set(listener, unsub);
          }
        }
        this.$$l = {};
      }
    }
    // We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
    // and setting attributes through setAttribute etc, this is helpful
    attributeChangedCallback(attr2, _oldValue, newValue) {
      if (this.$$r) return;
      attr2 = this.$$g_p(attr2);
      this.$$d[attr2] = get_custom_element_value(attr2, newValue, this.$$p_d, "toProp");
      this.$$c?.$set({ [attr2]: this.$$d[attr2] });
    }
    disconnectedCallback() {
      this.$$cn = false;
      Promise.resolve().then(() => {
        if (!this.$$cn && this.$$c) {
          this.$$c.$destroy();
          this.$$c = void 0;
        }
      });
    }
    $$g_p(attribute_name) {
      return Object.keys(this.$$p_d).find(
        (key) => this.$$p_d[key].attribute === attribute_name || !this.$$p_d[key].attribute && key.toLowerCase() === attribute_name
      ) || attribute_name;
    }
  };
}
function get_custom_element_value(prop, value, props_definition, transform) {
  const type = props_definition[prop]?.type;
  value = type === "Boolean" && typeof value !== "boolean" ? value != null : value;
  if (!transform || !props_definition[prop]) {
    return value;
  } else if (transform === "toAttribute") {
    switch (type) {
      case "Object":
      case "Array":
        return value == null ? null : JSON.stringify(value);
      case "Boolean":
        return value ? "" : null;
      case "Number":
        return value == null ? null : value;
      default:
        return value;
    }
  } else {
    switch (type) {
      case "Object":
      case "Array":
        return value && JSON.parse(value);
      case "Boolean":
        return value;
      // conversion already handled above
      case "Number":
        return value != null ? +value : value;
      default:
        return value;
    }
  }
}
function create_custom_element(Component, props_definition, slots, accessors, use_shadow_dom, extend2) {
  let Class = class extends SvelteElement {
    constructor() {
      super(Component, slots, use_shadow_dom);
      this.$$p_d = props_definition;
    }
    static get observedAttributes() {
      return Object.keys(props_definition).map(
        (key) => (props_definition[key].attribute || key).toLowerCase()
      );
    }
  };
  Object.keys(props_definition).forEach((prop) => {
    Object.defineProperty(Class.prototype, prop, {
      get() {
        return this.$$c && prop in this.$$c ? this.$$c[prop] : this.$$d[prop];
      },
      set(value) {
        value = get_custom_element_value(prop, value, props_definition);
        this.$$d[prop] = value;
        this.$$c?.$set({ [prop]: value });
      }
    });
  });
  accessors.forEach((accessor) => {
    Object.defineProperty(Class.prototype, accessor, {
      get() {
        return this.$$c?.[accessor];
      }
    });
  });
  Component.element = /** @type {any} */
  Class;
  return Class;
}
class SvelteComponent {
  /**
   * ### PRIVATE API
   *
   * Do not use, may change at any time
   *
   * @type {any}
   */
  $$ = void 0;
  /**
   * ### PRIVATE API
   *
   * Do not use, may change at any time
   *
   * @type {any}
   */
  $$set = void 0;
  /** @returns {void} */
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop;
  }
  /**
   * @template {Extract<keyof Events, string>} K
   * @param {K} type
   * @param {((e: Events[K]) => void) | null | undefined} callback
   * @returns {() => void}
   */
  $on(type, callback) {
    if (!is_function(callback)) {
      return noop;
    }
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback);
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1) callbacks.splice(index, 1);
    };
  }
  /**
   * @param {Partial<Props>} props
   * @returns {void}
   */
  $set(props) {
    if (this.$$set && !is_empty(props)) {
      this.$$.skip_bound = true;
      this.$$set(props);
      this.$$.skip_bound = false;
    }
  }
}
const PUBLIC_VERSION = "4";
if (typeof window !== "undefined")
  (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(PUBLIC_VERSION);
const subscriber_queue = [];
function writable(value, start2 = noop) {
  let stop;
  const subscribers = /* @__PURE__ */ new Set();
  function set2(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update2(fn2) {
    set2(fn2(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start2(set2, update2) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0 && stop) {
        stop();
        stop = null;
      }
    };
  }
  return { set: set2, update: update2, subscribe: subscribe2 };
}
function is_date(obj) {
  return Object.prototype.toString.call(obj) === "[object Date]";
}
function tick_spring(ctx, last_value, current_value, target_value) {
  if (typeof current_value === "number" || is_date(current_value)) {
    const delta = target_value - current_value;
    const velocity = (current_value - last_value) / (ctx.dt || 1 / 60);
    const spring2 = ctx.opts.stiffness * delta;
    const damper = ctx.opts.damping * velocity;
    const acceleration = (spring2 - damper) * ctx.inv_mass;
    const d = (velocity + acceleration) * ctx.dt;
    if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
      return target_value;
    } else {
      ctx.settled = false;
      return is_date(current_value) ? new Date(current_value.getTime() + d) : current_value + d;
    }
  } else if (Array.isArray(current_value)) {
    return current_value.map(
      (_, i) => tick_spring(ctx, last_value[i], current_value[i], target_value[i])
    );
  } else if (typeof current_value === "object") {
    const next_value = {};
    for (const k in current_value) {
      next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
    }
    return next_value;
  } else {
    throw new Error(`Cannot spring ${typeof current_value} values`);
  }
}
function spring(value, opts = {}) {
  const store = writable(value);
  const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
  let last_time;
  let task;
  let current_token;
  let last_value = value;
  let target_value = value;
  let inv_mass = 1;
  let inv_mass_recovery_rate = 0;
  let cancel_task = false;
  function set2(new_value, opts2 = {}) {
    target_value = new_value;
    const token = current_token = {};
    if (value == null || opts2.hard || spring2.stiffness >= 1 && spring2.damping >= 1) {
      cancel_task = true;
      last_time = now();
      last_value = new_value;
      store.set(value = target_value);
      return Promise.resolve();
    } else if (opts2.soft) {
      const rate = opts2.soft === true ? 0.5 : +opts2.soft;
      inv_mass_recovery_rate = 1 / (rate * 60);
      inv_mass = 0;
    }
    if (!task) {
      last_time = now();
      cancel_task = false;
      task = loop((now2) => {
        if (cancel_task) {
          cancel_task = false;
          task = null;
          return false;
        }
        inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
        const ctx = {
          inv_mass,
          opts: spring2,
          settled: true,
          dt: (now2 - last_time) * 60 / 1e3
        };
        const next_value = tick_spring(ctx, last_value, value, target_value);
        last_time = now2;
        last_value = value;
        store.set(value = next_value);
        if (ctx.settled) {
          task = null;
        }
        return !ctx.settled;
      });
    }
    return new Promise((fulfil) => {
      task.promise.then(() => {
        if (token === current_token) fulfil();
      });
    });
  }
  const spring2 = {
    set: set2,
    update: (fn2, opts2) => set2(fn2(target_value, value), opts2),
    subscribe: store.subscribe,
    stiffness,
    damping,
    precision
  };
  return spring2;
}
function isFiniteNumber(value) {
  return typeof value === "number" && !isNaN(value) && isFinite(value);
}
const coerceFloat = (value, precision = 2) => {
  return parseFloat((+value).toFixed(precision));
};
const clampValue = function(value, min2, max2) {
  return value <= min2 ? min2 : value >= max2 ? max2 : value;
};
const valueAsPercent = function(value, min2, max2, precision = 2) {
  let percent = (value - min2) / (max2 - min2) * 100;
  if (isNaN(percent) || percent <= 0) {
    return 0;
  } else if (percent >= 100) {
    return 100;
  } else {
    return coerceFloat(percent, precision);
  }
};
const percentAsValue = function(percent, min2, max2) {
  return (max2 - min2) / 100 * percent + min2;
};
const constrainAndAlignValue = function(value, min2, max2, step, precision = 2, limits = null) {
  value = isFiniteNumber(value) ? value : limits?.[0] ?? min2;
  if (value <= (limits?.[0] ?? min2) || value >= (limits?.[1] ?? max2)) {
    return value = clampValue(value, limits?.[0] ?? min2, limits?.[1] ?? max2);
  }
  let remainder = (value - min2) % step;
  let aligned = value - remainder;
  if (Math.abs(remainder) * 2 >= step) {
    aligned += remainder > 0 ? step : -step;
  } else if (value >= max2 - remainder) {
    aligned = max2;
  }
  aligned = clampValue(aligned, limits?.[0] ?? min2, limits?.[1] ?? max2);
  return coerceFloat(aligned, precision);
};
const pureText = (possibleHtml = "") => {
  return `${possibleHtml}`.replace(/<[^>]*>/g, "");
};
const normalisedClient = (event) => {
  const { clientX, clientY } = "touches" in event ? event.touches[0] || event.changedTouches[0] : event;
  return { x: clientX, y: clientY };
};
const elementIndex = (el) => {
  if (!el)
    return -1;
  var i = 0;
  while (el = el.previousElementSibling) {
    i++;
  }
  return i;
};
const isInRange = (value, range, type) => {
  if (type === "min") {
    return range[0] > value;
  } else if (type === "max") {
    return range[0] < value;
  } else if (type) {
    return range[0] < value && range[1] > value;
  }
};
const isOutOfLimit = (value, limits) => {
  if (!limits)
    return false;
  return value < limits[0] || value > limits[1];
};
const isSelected = (value, values, precision = 2) => {
  return values.some((v) => coerceFloat(v, precision) === coerceFloat(value, precision));
};
const getValueFromIndex = (index, min2, max2, pipStep, step, precision = 2) => {
  return coerceFloat(min2 + index * step * pipStep, precision);
};
const calculatePointerValues = (slider, clientPos, vertical, reversed, min2, max2) => {
  const dims = slider.getBoundingClientRect();
  let pointerPos = 0;
  let pointerPercent = 0;
  let pointerVal = 0;
  if (vertical) {
    pointerPos = clientPos.y - dims.top;
    pointerPercent = pointerPos / dims.height * 100;
    pointerPercent = reversed ? pointerPercent : 100 - pointerPercent;
  } else {
    pointerPos = clientPos.x - dims.left;
    pointerPercent = pointerPos / dims.width * 100;
    pointerPercent = reversed ? 100 - pointerPercent : pointerPercent;
  }
  pointerVal = percentAsValue(pointerPercent, min2, max2);
  return { pointerVal, pointerPercent };
};
function add_css$1(target) {
  append_styles(target, "svelte-it72d8", ".rangePips{--pip:var(--range-pip, var(--slider-base));--pip-text:var(--range-pip-text, var(--pip));--pip-active:var(--range-pip-active, var(--slider-fg));--pip-active-text:var(--range-pip-active-text, var(--pip-active));--pip-hover:var(--range-pip-hover, var(--slider-fg));--pip-hover-text:var(--range-pip-hover-text, var(--pip-hover));--pip-in-range:var(--range-pip-in-range, var(--pip-active));--pip-in-range-text:var(--range-pip-in-range-text, var(--pip-active-text));--pip-out-of-limit:var(--range-pip-out-of-limit, var(--slider-base-100));--pip-out-of-limit-text:var(--range-pip-out-of-limit-text, var(--pip-out-of-limit))}.rangePips{position:absolute;transform:translate3d(0, 0, 0.001px);height:1em;left:0;right:0;bottom:-1em;font-variant-numeric:tabular-nums}.rangePips.rsVertical{height:auto;width:1em;left:100%;right:auto;top:0;bottom:0}.rangePips .rsPip{height:0.4em;position:absolute;top:0.25em;width:1px;white-space:nowrap;transform:translate3d(0, 0, 0.001px)}.rangePips.rsVertical .rsPip{height:1px;width:0.4em;left:0.25em;top:auto;bottom:auto}.rangePips .rsPipVal{position:absolute;top:0.4em;transform:translate(-50%, 25%);display:inline-flex}.rangePips.rsVertical .rsPipVal{position:absolute;top:0;left:0.4em;transform:translate(25%, -50%)}.rangePips .rsPip{transition:all 0.15s ease}.rangePips .rsPipVal{transition:all 0.15s ease,\n      font-weight 0s linear}.rangePips .rsPip{color:var(--pip-text);background-color:var(--pip)}.rangePips .rsPip.rsSelected{color:var(--pip-active-text);background-color:var(--pip-active)}.rangePips.rsHoverable:not(.rsDisabled) .rsPip:not(.rsOutOfLimit):hover{color:var(--pip-hover-text);background-color:var(--pip-hover)}.rangePips .rsPip.rsInRange{color:var(--pip-in-range-text);background-color:var(--pip-in-range)}.rangePips .rsPip.rsOutOfLimit{color:var(--pip-out-of-limit-text);background-color:var(--pip-out-of-limit)}.rangePips .rsPip.rsSelected{height:0.75em}.rangePips.rsVertical .rsPip.rsSelected{height:1px;width:0.75em}.rangePips .rsPip.rsSelected .rsPipVal{font-weight:bold;top:0.75em}.rangePips.rsVertical .rsPip.rsSelected .rsPipVal{top:0;left:0.75em}.rangePips.rsHoverable:not(.rsDisabled) .rsPip:not(.rsSelected):not(.rsOutOfLimit):hover{transition:none}.rangePips.rsHoverable:not(.rsDisabled) .rsPip:not(.rsSelected):not(.rsOutOfLimit):hover .rsPipVal{transition:none;font-weight:bold}");
}
function get_each_context$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[36] = list[i];
  child_ctx[39] = i;
  const constants_0 = getValueFromIndex(
    /*i*/
    child_ctx[39],
    /*min*/
    child_ctx[1],
    /*max*/
    child_ctx[2],
    /*finalPipStep*/
    child_ctx[21],
    /*step*/
    child_ctx[3],
    /*precision*/
    child_ctx[17]
  );
  child_ctx[37] = constants_0;
  return child_ctx;
}
function create_if_block_9$1(ctx) {
  let span;
  let span_style_value;
  let span_data_val_value;
  let mounted;
  let dispose;
  let if_block = (
    /*all*/
    (ctx[10] === "label" || /*first*/
    ctx[11] === "label") && create_if_block_10$1(ctx)
  );
  return {
    c() {
      span = element("span");
      if (if_block) if_block.c();
      attr(span, "class", "rsPip rsPip--first");
      attr(span, "style", span_style_value = /*orientationStart*/
      ctx[19] + ": 0%;");
      attr(span, "data-val", span_data_val_value = coerceFloat(
        /*min*/
        ctx[1],
        /*precision*/
        ctx[17]
      ));
      attr(span, "data-index", 0);
      toggle_class(span, "rsSelected", isSelected(
        /*min*/
        ctx[1],
        /*values*/
        ctx[4],
        /*precision*/
        ctx[17]
      ));
      toggle_class(span, "rsInRange", isInRange(
        /*min*/
        ctx[1],
        /*values*/
        ctx[4],
        /*range*/
        ctx[0]
      ));
      toggle_class(span, "rsOutOfLimit", isOutOfLimit(
        /*min*/
        ctx[1],
        /*limits*/
        ctx[9]
      ));
    },
    m(target, anchor) {
      insert(target, span, anchor);
      if (if_block) if_block.m(span, null);
      if (!mounted) {
        dispose = [
          listen(
            span,
            "pointerdown",
            /*pointerdown_handler*/
            ctx[29]
          ),
          listen(
            span,
            "pointerup",
            /*pointerup_handler*/
            ctx[30]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (
        /*all*/
        ctx2[10] === "label" || /*first*/
        ctx2[11] === "label"
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_10$1(ctx2);
          if_block.c();
          if_block.m(span, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty[0] & /*orientationStart*/
      524288 && span_style_value !== (span_style_value = /*orientationStart*/
      ctx2[19] + ": 0%;")) {
        attr(span, "style", span_style_value);
      }
      if (dirty[0] & /*min, precision*/
      131074 && span_data_val_value !== (span_data_val_value = coerceFloat(
        /*min*/
        ctx2[1],
        /*precision*/
        ctx2[17]
      ))) {
        attr(span, "data-val", span_data_val_value);
      }
      if (dirty[0] & /*min, values, precision*/
      131090) {
        toggle_class(span, "rsSelected", isSelected(
          /*min*/
          ctx2[1],
          /*values*/
          ctx2[4],
          /*precision*/
          ctx2[17]
        ));
      }
      if (dirty[0] & /*min, values, range*/
      19) {
        toggle_class(span, "rsInRange", isInRange(
          /*min*/
          ctx2[1],
          /*values*/
          ctx2[4],
          /*range*/
          ctx2[0]
        ));
      }
      if (dirty[0] & /*min, limits*/
      514) {
        toggle_class(span, "rsOutOfLimit", isOutOfLimit(
          /*min*/
          ctx2[1],
          /*limits*/
          ctx2[9]
        ));
      }
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
      if (if_block) if_block.d();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_10$1(ctx) {
  let span;
  let t0;
  let html_tag;
  let raw_value = (
    /*formatter*/
    ctx[16](coerceFloat(
      /*min*/
      ctx[1],
      /*precision*/
      ctx[17]
    ), 0, 0) + ""
  );
  let t1;
  let if_block0 = (
    /*prefix*/
    ctx[14] && create_if_block_12(ctx)
  );
  let if_block1 = (
    /*suffix*/
    ctx[15] && create_if_block_11$1(ctx)
  );
  return {
    c() {
      span = element("span");
      if (if_block0) if_block0.c();
      t0 = space();
      html_tag = new HtmlTag(false);
      t1 = space();
      if (if_block1) if_block1.c();
      html_tag.a = t1;
      attr(span, "class", "rsPipVal");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      if (if_block0) if_block0.m(span, null);
      append(span, t0);
      html_tag.m(raw_value, span);
      append(span, t1);
      if (if_block1) if_block1.m(span, null);
    },
    p(ctx2, dirty) {
      if (
        /*prefix*/
        ctx2[14]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_12(ctx2);
          if_block0.c();
          if_block0.m(span, t0);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (dirty[0] & /*formatter, min, precision*/
      196610 && raw_value !== (raw_value = /*formatter*/
      ctx2[16](coerceFloat(
        /*min*/
        ctx2[1],
        /*precision*/
        ctx2[17]
      ), 0, 0) + "")) html_tag.p(raw_value);
      if (
        /*suffix*/
        ctx2[15]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_11$1(ctx2);
          if_block1.c();
          if_block1.m(span, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
    }
  };
}
function create_if_block_12(ctx) {
  let span;
  let t;
  return {
    c() {
      span = element("span");
      t = text(
        /*prefix*/
        ctx[14]
      );
      attr(span, "class", "rsPipValPrefix");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*prefix*/
      16384) set_data(
        t,
        /*prefix*/
        ctx2[14]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_if_block_11$1(ctx) {
  let span;
  let t;
  return {
    c() {
      span = element("span");
      t = text(
        /*suffix*/
        ctx[15]
      );
      attr(span, "class", "rsPipValSuffix");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*suffix*/
      32768) set_data(
        t,
        /*suffix*/
        ctx2[15]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_if_block_4$1(ctx) {
  let each_1_anchor;
  let each_value = ensure_array_like(Array(
    /*pipCount*/
    ctx[20]
  ));
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
  }
  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert(target, each_1_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*orientationStart, min, max, finalPipStep, step, precision, values, range, limits, labelDown, labelUp, suffix, formatter, prefix, all, rest, pipCount*/
      16508447) {
        each_value = ensure_array_like(Array(
          /*pipCount*/
          ctx2[20]
        ));
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$1(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(each_1_anchor);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_if_block_5$1(ctx) {
  let span;
  let t;
  let span_style_value;
  let span_data_val_value;
  let mounted;
  let dispose;
  let if_block = (
    /*all*/
    (ctx[10] === "label" || /*rest*/
    ctx[13] === "label") && create_if_block_6$1(ctx)
  );
  function pointerup_handler_1(...args) {
    return (
      /*pointerup_handler_1*/
      ctx[32](
        /*val*/
        ctx[37],
        ...args
      )
    );
  }
  return {
    c() {
      span = element("span");
      if (if_block) if_block.c();
      t = space();
      attr(span, "class", "rsPip");
      attr(span, "style", span_style_value = /*orientationStart*/
      ctx[19] + ": " + valueAsPercent(
        /*val*/
        ctx[37],
        /*min*/
        ctx[1],
        /*max*/
        ctx[2],
        /*precision*/
        ctx[17]
      ) + "%;");
      attr(span, "data-val", span_data_val_value = /*val*/
      ctx[37]);
      attr(
        span,
        "data-index",
        /*i*/
        ctx[39]
      );
      toggle_class(span, "rsSelected", isSelected(
        /*val*/
        ctx[37],
        /*values*/
        ctx[4],
        /*precision*/
        ctx[17]
      ));
      toggle_class(span, "rsInRange", isInRange(
        /*val*/
        ctx[37],
        /*values*/
        ctx[4],
        /*range*/
        ctx[0]
      ));
      toggle_class(span, "rsOutOfLimit", isOutOfLimit(
        /*val*/
        ctx[37],
        /*limits*/
        ctx[9]
      ));
    },
    m(target, anchor) {
      insert(target, span, anchor);
      if (if_block) if_block.m(span, null);
      append(span, t);
      if (!mounted) {
        dispose = [
          listen(
            span,
            "pointerdown",
            /*pointerdown_handler_1*/
            ctx[31]
          ),
          listen(span, "pointerup", pointerup_handler_1)
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (
        /*all*/
        ctx[10] === "label" || /*rest*/
        ctx[13] === "label"
      ) {
        if (if_block) {
          if_block.p(ctx, dirty);
        } else {
          if_block = create_if_block_6$1(ctx);
          if_block.c();
          if_block.m(span, t);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty[0] & /*orientationStart, min, max, finalPipStep, step, precision*/
      2752526 && span_style_value !== (span_style_value = /*orientationStart*/
      ctx[19] + ": " + valueAsPercent(
        /*val*/
        ctx[37],
        /*min*/
        ctx[1],
        /*max*/
        ctx[2],
        /*precision*/
        ctx[17]
      ) + "%;")) {
        attr(span, "style", span_style_value);
      }
      if (dirty[0] & /*min, max, finalPipStep, step, precision*/
      2228238 && span_data_val_value !== (span_data_val_value = /*val*/
      ctx[37])) {
        attr(span, "data-val", span_data_val_value);
      }
      if (dirty[0] & /*min, max, finalPipStep, step, precision, values*/
      2228254) {
        toggle_class(span, "rsSelected", isSelected(
          /*val*/
          ctx[37],
          /*values*/
          ctx[4],
          /*precision*/
          ctx[17]
        ));
      }
      if (dirty[0] & /*min, max, finalPipStep, step, precision, values, range*/
      2228255) {
        toggle_class(span, "rsInRange", isInRange(
          /*val*/
          ctx[37],
          /*values*/
          ctx[4],
          /*range*/
          ctx[0]
        ));
      }
      if (dirty[0] & /*min, max, finalPipStep, step, precision, limits*/
      2228750) {
        toggle_class(span, "rsOutOfLimit", isOutOfLimit(
          /*val*/
          ctx[37],
          /*limits*/
          ctx[9]
        ));
      }
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
      if (if_block) if_block.d();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_6$1(ctx) {
  let span;
  let t0;
  let html_tag;
  let raw_value = (
    /*formatter*/
    ctx[16](
      /*val*/
      ctx[37],
      /*i*/
      ctx[39],
      valueAsPercent(
        /*val*/
        ctx[37],
        /*min*/
        ctx[1],
        /*max*/
        ctx[2],
        /*precision*/
        ctx[17]
      )
    ) + ""
  );
  let t1;
  let if_block0 = create_if_block_8$1(ctx);
  let if_block1 = create_if_block_7$1(ctx);
  return {
    c() {
      span = element("span");
      if (if_block0) if_block0.c();
      t0 = space();
      html_tag = new HtmlTag(false);
      t1 = space();
      if (if_block1) if_block1.c();
      html_tag.a = t1;
      attr(span, "class", "rsPipVal");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      if (if_block0) if_block0.m(span, null);
      append(span, t0);
      html_tag.m(raw_value, span);
      append(span, t1);
      if (if_block1) if_block1.m(span, null);
    },
    p(ctx2, dirty) {
      {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_8$1(ctx2);
          if_block0.c();
          if_block0.m(span, t0);
        }
      }
      if (dirty[0] & /*formatter, min, max, finalPipStep, step, precision*/
      2293774 && raw_value !== (raw_value = /*formatter*/
      ctx2[16](
        /*val*/
        ctx2[37],
        /*i*/
        ctx2[39],
        valueAsPercent(
          /*val*/
          ctx2[37],
          /*min*/
          ctx2[1],
          /*max*/
          ctx2[2],
          /*precision*/
          ctx2[17]
        )
      ) + "")) html_tag.p(raw_value);
      {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_7$1(ctx2);
          if_block1.c();
          if_block1.m(span, null);
        }
      }
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
    }
  };
}
function create_if_block_8$1(ctx) {
  let span;
  let t;
  return {
    c() {
      span = element("span");
      t = text(
        /*prefix*/
        ctx[14]
      );
      attr(span, "class", "rsPipValPrefix");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*prefix*/
      16384) set_data(
        t,
        /*prefix*/
        ctx2[14]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_if_block_7$1(ctx) {
  let span;
  let t;
  return {
    c() {
      span = element("span");
      t = text(
        /*suffix*/
        ctx[15]
      );
      attr(span, "class", "rsPipValSuffix");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*suffix*/
      32768) set_data(
        t,
        /*suffix*/
        ctx2[15]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_each_block$1(ctx) {
  let if_block_anchor;
  let if_block = (
    /*val*/
    ctx[37] > /*min*/
    ctx[1] && /*val*/
    ctx[37] < /*max*/
    ctx[2] && create_if_block_5$1(ctx)
  );
  return {
    c() {
      if (if_block) if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block) if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (
        /*val*/
        ctx2[37] > /*min*/
        ctx2[1] && /*val*/
        ctx2[37] < /*max*/
        ctx2[2]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_5$1(ctx2);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(if_block_anchor);
      }
      if (if_block) if_block.d(detaching);
    }
  };
}
function create_if_block$1(ctx) {
  let span;
  let span_style_value;
  let span_data_val_value;
  let mounted;
  let dispose;
  let if_block = (
    /*all*/
    (ctx[10] === "label" || /*last*/
    ctx[12] === "label") && create_if_block_1$1(ctx)
  );
  return {
    c() {
      span = element("span");
      if (if_block) if_block.c();
      attr(span, "class", "rsPip rsPip--last");
      attr(span, "style", span_style_value = /*orientationStart*/
      ctx[19] + ": 100%;");
      attr(span, "data-val", span_data_val_value = coerceFloat(
        /*max*/
        ctx[2],
        /*precision*/
        ctx[17]
      ));
      attr(
        span,
        "data-index",
        /*pipCount*/
        ctx[20]
      );
      toggle_class(span, "rsSelected", isSelected(
        /*max*/
        ctx[2],
        /*values*/
        ctx[4],
        /*precision*/
        ctx[17]
      ));
      toggle_class(span, "rsInRange", isInRange(
        /*max*/
        ctx[2],
        /*values*/
        ctx[4],
        /*range*/
        ctx[0]
      ));
      toggle_class(span, "rsOutOfLimit", isOutOfLimit(
        /*max*/
        ctx[2],
        /*limits*/
        ctx[9]
      ));
    },
    m(target, anchor) {
      insert(target, span, anchor);
      if (if_block) if_block.m(span, null);
      if (!mounted) {
        dispose = [
          listen(
            span,
            "pointerdown",
            /*pointerdown_handler_2*/
            ctx[33]
          ),
          listen(
            span,
            "pointerup",
            /*pointerup_handler_2*/
            ctx[34]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (
        /*all*/
        ctx2[10] === "label" || /*last*/
        ctx2[12] === "label"
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_1$1(ctx2);
          if_block.c();
          if_block.m(span, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty[0] & /*orientationStart*/
      524288 && span_style_value !== (span_style_value = /*orientationStart*/
      ctx2[19] + ": 100%;")) {
        attr(span, "style", span_style_value);
      }
      if (dirty[0] & /*max, precision*/
      131076 && span_data_val_value !== (span_data_val_value = coerceFloat(
        /*max*/
        ctx2[2],
        /*precision*/
        ctx2[17]
      ))) {
        attr(span, "data-val", span_data_val_value);
      }
      if (dirty[0] & /*pipCount*/
      1048576) {
        attr(
          span,
          "data-index",
          /*pipCount*/
          ctx2[20]
        );
      }
      if (dirty[0] & /*max, values, precision*/
      131092) {
        toggle_class(span, "rsSelected", isSelected(
          /*max*/
          ctx2[2],
          /*values*/
          ctx2[4],
          /*precision*/
          ctx2[17]
        ));
      }
      if (dirty[0] & /*max, values, range*/
      21) {
        toggle_class(span, "rsInRange", isInRange(
          /*max*/
          ctx2[2],
          /*values*/
          ctx2[4],
          /*range*/
          ctx2[0]
        ));
      }
      if (dirty[0] & /*max, limits*/
      516) {
        toggle_class(span, "rsOutOfLimit", isOutOfLimit(
          /*max*/
          ctx2[2],
          /*limits*/
          ctx2[9]
        ));
      }
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
      if (if_block) if_block.d();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_1$1(ctx) {
  let span;
  let t0;
  let html_tag;
  let raw_value = (
    /*formatter*/
    ctx[16](
      coerceFloat(
        /*max*/
        ctx[2],
        /*precision*/
        ctx[17]
      ),
      /*pipCount*/
      ctx[20],
      100
    ) + ""
  );
  let t1;
  let if_block0 = (
    /*prefix*/
    ctx[14] && create_if_block_3$1(ctx)
  );
  let if_block1 = (
    /*suffix*/
    ctx[15] && create_if_block_2$1(ctx)
  );
  return {
    c() {
      span = element("span");
      if (if_block0) if_block0.c();
      t0 = space();
      html_tag = new HtmlTag(false);
      t1 = space();
      if (if_block1) if_block1.c();
      html_tag.a = t1;
      attr(span, "class", "rsPipVal");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      if (if_block0) if_block0.m(span, null);
      append(span, t0);
      html_tag.m(raw_value, span);
      append(span, t1);
      if (if_block1) if_block1.m(span, null);
    },
    p(ctx2, dirty) {
      if (
        /*prefix*/
        ctx2[14]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_3$1(ctx2);
          if_block0.c();
          if_block0.m(span, t0);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (dirty[0] & /*formatter, max, precision, pipCount*/
      1245188 && raw_value !== (raw_value = /*formatter*/
      ctx2[16](
        coerceFloat(
          /*max*/
          ctx2[2],
          /*precision*/
          ctx2[17]
        ),
        /*pipCount*/
        ctx2[20],
        100
      ) + "")) html_tag.p(raw_value);
      if (
        /*suffix*/
        ctx2[15]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_2$1(ctx2);
          if_block1.c();
          if_block1.m(span, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
    }
  };
}
function create_if_block_3$1(ctx) {
  let span;
  let t;
  return {
    c() {
      span = element("span");
      t = text(
        /*prefix*/
        ctx[14]
      );
      attr(span, "class", "rsPipValPrefix");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*prefix*/
      16384) set_data(
        t,
        /*prefix*/
        ctx2[14]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_if_block_2$1(ctx) {
  let span;
  let t;
  return {
    c() {
      span = element("span");
      t = text(
        /*suffix*/
        ctx[15]
      );
      attr(span, "class", "rsPipValSuffix");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*suffix*/
      32768) set_data(
        t,
        /*suffix*/
        ctx2[15]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_fragment$1(ctx) {
  let div2;
  let t0;
  let t1;
  let if_block0 = (
    /*all*/
    (ctx[10] && /*first*/
    ctx[11] !== false || /*first*/
    ctx[11]) && create_if_block_9$1(ctx)
  );
  let if_block1 = (
    /*all*/
    (ctx[10] && /*rest*/
    ctx[13] !== false || /*rest*/
    ctx[13]) && create_if_block_4$1(ctx)
  );
  let if_block2 = (
    /*all*/
    (ctx[10] && /*last*/
    ctx[12] !== false || /*last*/
    ctx[12]) && create_if_block$1(ctx)
  );
  return {
    c() {
      div2 = element("div");
      if (if_block0) if_block0.c();
      t0 = space();
      if (if_block1) if_block1.c();
      t1 = space();
      if (if_block2) if_block2.c();
      attr(div2, "class", "rangePips");
      toggle_class(
        div2,
        "rsDisabled",
        /*disabled*/
        ctx[8]
      );
      toggle_class(
        div2,
        "rsHoverable",
        /*hoverable*/
        ctx[7]
      );
      toggle_class(
        div2,
        "rsVertical",
        /*vertical*/
        ctx[5]
      );
      toggle_class(
        div2,
        "rsReversed",
        /*reversed*/
        ctx[6]
      );
      toggle_class(
        div2,
        "rsFocus",
        /*focus*/
        ctx[18]
      );
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      if (if_block0) if_block0.m(div2, null);
      append(div2, t0);
      if (if_block1) if_block1.m(div2, null);
      append(div2, t1);
      if (if_block2) if_block2.m(div2, null);
    },
    p(ctx2, dirty) {
      if (
        /*all*/
        ctx2[10] && /*first*/
        ctx2[11] !== false || /*first*/
        ctx2[11]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_9$1(ctx2);
          if_block0.c();
          if_block0.m(div2, t0);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (
        /*all*/
        ctx2[10] && /*rest*/
        ctx2[13] !== false || /*rest*/
        ctx2[13]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_4$1(ctx2);
          if_block1.c();
          if_block1.m(div2, t1);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (
        /*all*/
        ctx2[10] && /*last*/
        ctx2[12] !== false || /*last*/
        ctx2[12]
      ) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
        } else {
          if_block2 = create_if_block$1(ctx2);
          if_block2.c();
          if_block2.m(div2, null);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
      if (dirty[0] & /*disabled*/
      256) {
        toggle_class(
          div2,
          "rsDisabled",
          /*disabled*/
          ctx2[8]
        );
      }
      if (dirty[0] & /*hoverable*/
      128) {
        toggle_class(
          div2,
          "rsHoverable",
          /*hoverable*/
          ctx2[7]
        );
      }
      if (dirty[0] & /*vertical*/
      32) {
        toggle_class(
          div2,
          "rsVertical",
          /*vertical*/
          ctx2[5]
        );
      }
      if (dirty[0] & /*reversed*/
      64) {
        toggle_class(
          div2,
          "rsReversed",
          /*reversed*/
          ctx2[6]
        );
      }
      if (dirty[0] & /*focus*/
      262144) {
        toggle_class(
          div2,
          "rsFocus",
          /*focus*/
          ctx2[18]
        );
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(div2);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
      if (if_block2) if_block2.d();
    }
  };
}
const limitPipCount = 500;
function instance$1($$self, $$props, $$invalidate) {
  let stepMax;
  let tooManySteps;
  let { range = false } = $$props;
  let { min: min2 = 0 } = $$props;
  let { max: max2 = 100 } = $$props;
  let { step = 1 } = $$props;
  let { value = (max2 + min2) / 2 } = $$props;
  let { values = [value] } = $$props;
  let { vertical = false } = $$props;
  let { reversed = false } = $$props;
  let { hoverable = true } = $$props;
  let { disabled = false } = $$props;
  let { limits = null } = $$props;
  let { pipstep = void 0 } = $$props;
  let { all = true } = $$props;
  let { first = void 0 } = $$props;
  let { last = void 0 } = $$props;
  let { rest = void 0 } = $$props;
  let { prefix = "" } = $$props;
  let { suffix = "" } = $$props;
  let { formatter = (v, i, p) => v } = $$props;
  let { precision = 2 } = $$props;
  let { focus } = $$props;
  let { orientationStart } = $$props;
  let { moveHandle } = $$props;
  let clientStart = null;
  let pipCount = 0;
  let finalPipStep = 1;
  function labelDown(event) {
    clientStart = normalisedClient(event);
  }
  function labelUp(pipValue, event) {
    const clientEnd = normalisedClient(event);
    if (!disabled && clientStart) {
      const distanceMoved = Math.sqrt(Math.pow(clientStart.x - clientEnd.x, 2) + Math.pow(clientStart.y - clientEnd.y, 2));
      if (distanceMoved <= 5) {
        moveHandle(null, pipValue);
      }
      clientStart = null;
    }
  }
  const pointerdown_handler = (e) => {
    labelDown(e);
  };
  const pointerup_handler = (e) => {
    labelUp(min2, e);
  };
  const pointerdown_handler_1 = (e) => {
    labelDown(e);
  };
  const pointerup_handler_1 = (val, e) => {
    labelUp(val, e);
  };
  const pointerdown_handler_2 = (e) => {
    labelDown(e);
  };
  const pointerup_handler_2 = (e) => {
    labelUp(max2, e);
  };
  $$self.$$set = ($$props2) => {
    if ("range" in $$props2) $$invalidate(0, range = $$props2.range);
    if ("min" in $$props2) $$invalidate(1, min2 = $$props2.min);
    if ("max" in $$props2) $$invalidate(2, max2 = $$props2.max);
    if ("step" in $$props2) $$invalidate(3, step = $$props2.step);
    if ("value" in $$props2) $$invalidate(24, value = $$props2.value);
    if ("values" in $$props2) $$invalidate(4, values = $$props2.values);
    if ("vertical" in $$props2) $$invalidate(5, vertical = $$props2.vertical);
    if ("reversed" in $$props2) $$invalidate(6, reversed = $$props2.reversed);
    if ("hoverable" in $$props2) $$invalidate(7, hoverable = $$props2.hoverable);
    if ("disabled" in $$props2) $$invalidate(8, disabled = $$props2.disabled);
    if ("limits" in $$props2) $$invalidate(9, limits = $$props2.limits);
    if ("pipstep" in $$props2) $$invalidate(25, pipstep = $$props2.pipstep);
    if ("all" in $$props2) $$invalidate(10, all = $$props2.all);
    if ("first" in $$props2) $$invalidate(11, first = $$props2.first);
    if ("last" in $$props2) $$invalidate(12, last = $$props2.last);
    if ("rest" in $$props2) $$invalidate(13, rest = $$props2.rest);
    if ("prefix" in $$props2) $$invalidate(14, prefix = $$props2.prefix);
    if ("suffix" in $$props2) $$invalidate(15, suffix = $$props2.suffix);
    if ("formatter" in $$props2) $$invalidate(16, formatter = $$props2.formatter);
    if ("precision" in $$props2) $$invalidate(17, precision = $$props2.precision);
    if ("focus" in $$props2) $$invalidate(18, focus = $$props2.focus);
    if ("orientationStart" in $$props2) $$invalidate(19, orientationStart = $$props2.orientationStart);
    if ("moveHandle" in $$props2) $$invalidate(26, moveHandle = $$props2.moveHandle);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*vertical*/
    32) {
      $$invalidate(27, stepMax = vertical ? 50 : 100);
    }
    if ($$self.$$.dirty[0] & /*max, min, step, stepMax*/
    134217742) {
      $$invalidate(28, tooManySteps = (max2 - min2) / step >= stepMax);
    }
    if ($$self.$$.dirty[0] & /*pipstep, tooManySteps, max, min, stepMax, step, finalPipStep, pipCount*/
    439353358) {
      {
        $$invalidate(21, finalPipStep = pipstep ?? (tooManySteps ? (max2 - min2) / (stepMax / 5) : 1));
        $$invalidate(20, pipCount = Math.ceil((max2 - min2) / (step * finalPipStep)));
        if (pipCount > limitPipCount) {
          console.warn('RangePips: You are trying to render too many pips. This will cause performance issues. Try increasing the "pipstep" prop to reduce the number of pips shown.');
          while (pipCount >= limitPipCount) {
            $$invalidate(21, finalPipStep = finalPipStep + finalPipStep);
            $$invalidate(20, pipCount = Math.ceil((max2 - min2) / (step * finalPipStep)));
          }
        }
      }
    }
  };
  return [
    range,
    min2,
    max2,
    step,
    values,
    vertical,
    reversed,
    hoverable,
    disabled,
    limits,
    all,
    first,
    last,
    rest,
    prefix,
    suffix,
    formatter,
    precision,
    focus,
    orientationStart,
    pipCount,
    finalPipStep,
    labelDown,
    labelUp,
    value,
    pipstep,
    moveHandle,
    stepMax,
    tooManySteps,
    pointerdown_handler,
    pointerup_handler,
    pointerdown_handler_1,
    pointerup_handler_1,
    pointerdown_handler_2,
    pointerup_handler_2
  ];
}
class RangePips extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$1,
      create_fragment$1,
      safe_not_equal,
      {
        range: 0,
        min: 1,
        max: 2,
        step: 3,
        value: 24,
        values: 4,
        vertical: 5,
        reversed: 6,
        hoverable: 7,
        disabled: 8,
        limits: 9,
        pipstep: 25,
        all: 10,
        first: 11,
        last: 12,
        rest: 13,
        prefix: 14,
        suffix: 15,
        formatter: 16,
        precision: 17,
        focus: 18,
        orientationStart: 19,
        moveHandle: 26
      },
      add_css$1,
      [-1, -1]
    );
  }
  get range() {
    return this.$$.ctx[0];
  }
  set range(range) {
    this.$$set({ range });
    flush();
  }
  get min() {
    return this.$$.ctx[1];
  }
  set min(min2) {
    this.$$set({ min: min2 });
    flush();
  }
  get max() {
    return this.$$.ctx[2];
  }
  set max(max2) {
    this.$$set({ max: max2 });
    flush();
  }
  get step() {
    return this.$$.ctx[3];
  }
  set step(step) {
    this.$$set({ step });
    flush();
  }
  get value() {
    return this.$$.ctx[24];
  }
  set value(value) {
    this.$$set({ value });
    flush();
  }
  get values() {
    return this.$$.ctx[4];
  }
  set values(values) {
    this.$$set({ values });
    flush();
  }
  get vertical() {
    return this.$$.ctx[5];
  }
  set vertical(vertical) {
    this.$$set({ vertical });
    flush();
  }
  get reversed() {
    return this.$$.ctx[6];
  }
  set reversed(reversed) {
    this.$$set({ reversed });
    flush();
  }
  get hoverable() {
    return this.$$.ctx[7];
  }
  set hoverable(hoverable) {
    this.$$set({ hoverable });
    flush();
  }
  get disabled() {
    return this.$$.ctx[8];
  }
  set disabled(disabled) {
    this.$$set({ disabled });
    flush();
  }
  get limits() {
    return this.$$.ctx[9];
  }
  set limits(limits) {
    this.$$set({ limits });
    flush();
  }
  get pipstep() {
    return this.$$.ctx[25];
  }
  set pipstep(pipstep) {
    this.$$set({ pipstep });
    flush();
  }
  get all() {
    return this.$$.ctx[10];
  }
  set all(all) {
    this.$$set({ all });
    flush();
  }
  get first() {
    return this.$$.ctx[11];
  }
  set first(first) {
    this.$$set({ first });
    flush();
  }
  get last() {
    return this.$$.ctx[12];
  }
  set last(last) {
    this.$$set({ last });
    flush();
  }
  get rest() {
    return this.$$.ctx[13];
  }
  set rest(rest) {
    this.$$set({ rest });
    flush();
  }
  get prefix() {
    return this.$$.ctx[14];
  }
  set prefix(prefix) {
    this.$$set({ prefix });
    flush();
  }
  get suffix() {
    return this.$$.ctx[15];
  }
  set suffix(suffix) {
    this.$$set({ suffix });
    flush();
  }
  get formatter() {
    return this.$$.ctx[16];
  }
  set formatter(formatter) {
    this.$$set({ formatter });
    flush();
  }
  get precision() {
    return this.$$.ctx[17];
  }
  set precision(precision) {
    this.$$set({ precision });
    flush();
  }
  get focus() {
    return this.$$.ctx[18];
  }
  set focus(focus) {
    this.$$set({ focus });
    flush();
  }
  get orientationStart() {
    return this.$$.ctx[19];
  }
  set orientationStart(orientationStart) {
    this.$$set({ orientationStart });
    flush();
  }
  get moveHandle() {
    return this.$$.ctx[26];
  }
  set moveHandle(moveHandle) {
    this.$$set({ moveHandle });
    flush();
  }
}
create_custom_element(RangePips, { "range": { "type": "Boolean" }, "min": {}, "max": {}, "step": {}, "value": {}, "values": {}, "vertical": { "type": "Boolean" }, "reversed": { "type": "Boolean" }, "hoverable": { "type": "Boolean" }, "disabled": { "type": "Boolean" }, "limits": {}, "pipstep": {}, "all": { "type": "Boolean" }, "first": {}, "last": {}, "rest": {}, "prefix": {}, "suffix": {}, "formatter": {}, "precision": {}, "focus": {}, "orientationStart": {}, "moveHandle": {} }, [], [], true);
function add_css(target) {
  append_styles(target, "svelte-ufxuds", "@layer base{.rangeSlider{--slider-light-accent:#4a40d4;--slider-light-accent-100:#838de7;--slider-light-accent-text:#ffffff;--slider-light-base:#99a2a2;--slider-light-base-100:#b9c2c2;--slider-light-bg:#d7dada;--slider-light-fg:#3f3e4f;--slider-dark-accent:#6070fc;--slider-dark-accent-100:#7a7fab;--slider-dark-accent-text:#ffffff;--slider-dark-base:#82809f;--slider-dark-base-100:#595868;--slider-dark-bg:#3f3e4f;--slider-dark-fg:#d7dada;--slider-accent:var(--slider-light-accent);--slider-accent-100:var(--slider-light-accent-100);--slider-accent-text:var(--slider-light-accent-text);--slider-base:var(--slider-light-base);--slider-base-100:var(--slider-light-base-100);--slider-bg:var(--slider-light-bg);--slider-fg:var(--slider-light-fg);--slider:var(--range-slider, var(--slider-bg));--handle-inactive:var(--range-handle-inactive, var(--slider-base));--handle:var(--range-handle, var(--slider-accent-100));--handle-focus:var(--range-handle-focus, var(--slider-accent));--handle-border:var(--range-handle-border, var(--handle));--range-inactive:var(--range-range-inactive, var(--handle-inactive));--range:var(--range-range, var(--handle-focus));--range-limit:var(--range-range-limit, var(--slider-base-100));--range-hover:var(--range-range-hover, var(--handle-border));--range-press:var(--range-range-press, var(--handle-border));--float-inactive:var(--range-float-inactive, var(--handle-inactive));--float:var(--range-float, var(--handle-focus));--float-text:var(--range-float-text, var(--slider-accent-text))}.rangeSlider.rsDark{--slider-accent:var(--slider-dark-accent);--slider-accent-100:var(--slider-dark-accent-100);--slider-accent-text:var(--slider-dark-accent-text);--slider-base:var(--slider-dark-base);--slider-base-100:var(--slider-dark-base-100);--slider-bg:var(--slider-dark-bg);--slider-fg:var(--slider-dark-fg)}@media(prefers-color-scheme: dark){.rangeSlider.rsAutoDark{--slider-accent:var(--slider-dark-accent);--slider-accent-100:var(--slider-dark-accent-100);--slider-accent-text:var(--slider-dark-accent-text);--slider-base:var(--slider-dark-base);--slider-base-100:var(--slider-dark-base-100);--slider-bg:var(--slider-dark-bg);--slider-fg:var(--slider-dark-fg)}}}.rangeSlider{position:relative;border-radius:100px;height:0.5em;margin:1em;transition:opacity 0.2s ease;user-select:none;overflow:visible}.rangeSlider *{user-select:none}.rangeSlider.rsPips{margin-bottom:1.8em}.rangeSlider.rsPipLabels{margin-bottom:2.8em}.rangeSlider.rsVertical{display:inline-block;border-radius:100px;width:0.5em;min-height:200px}.rangeSlider.rsVertical.rsPips{margin-right:1.8em;margin-bottom:1em}.rangeSlider.rsVertical.rsPipLabels{margin-right:2.8em;margin-bottom:1em}.rangeSlider .rangeHandle{position:absolute;display:block;height:1.4em;width:1.4em;top:0.25em;bottom:auto;transform:translateY(-50%) translateX(-50%);translate:calc(var(--slider-length) * (var(--handle-pos) / 100) * 1px) 0;z-index:2}.rangeSlider.rsReversed .rangeHandle{transform:translateY(-50%) translateX(-50%);translate:calc((var(--slider-length) * 1px) - (var(--slider-length) * (var(--handle-pos) / 100) * 1px)) 0}.rangeSlider.rsVertical .rangeHandle{left:0.25em;top:auto;transform:translateY(-50%) translateX(-50%);translate:0 calc(var(--slider-length) * (1 - var(--handle-pos) / 100) * 1px)}.rangeSlider.rsVertical.rsReversed .rangeHandle{transform:translateY(-50%) translateX(-50%);translate:0 calc((var(--slider-length) * 1px) - (var(--slider-length) * (1 - var(--handle-pos) / 100) * 1px))}.rangeSlider .rangeNub,.rangeSlider .rangeHandle::before{position:absolute;left:0;top:0;display:block;border-radius:10em;height:100%;width:100%;transition:background 0.2s ease,\n      box-shadow 0.2s ease}.rangeSlider .rangeHandle::before{content:'';left:1px;top:1px;bottom:1px;right:1px;height:auto;width:auto;box-shadow:0 0 0 0px var(--handle-border);opacity:0;transition:opacity 0.2s ease,\n      box-shadow 0.2s ease}.rangeSlider.rsHoverable:not(.rsDisabled) .rangeHandle:hover::before{box-shadow:0 0 0 8px var(--handle-border);opacity:0.2}.rangeSlider.rsHoverable:not(.rsDisabled) .rangeHandle.rsPress::before,.rangeSlider.rsHoverable:not(.rsDisabled) .rangeHandle.rsPress:hover::before{box-shadow:0 0 0 12px var(--handle-border);opacity:0.4}.rangeSlider.rsRange:not(.rsMin):not(.rsMax) .rangeNub{border-radius:10em 10em 10em 1.6em}.rangeSlider.rsRange .rangeHandle:nth-of-type(1) .rangeNub{transform:rotate(-135deg)}.rangeSlider.rsRange .rangeHandle:nth-of-type(2) .rangeNub{transform:rotate(45deg)}.rangeSlider.rsRange.rsReversed .rangeHandle:nth-of-type(1) .rangeNub{transform:rotate(45deg)}.rangeSlider.rsRange.rsReversed .rangeHandle:nth-of-type(2) .rangeNub{transform:rotate(-135deg)}.rangeSlider.rsRange.rsVertical .rangeHandle:nth-of-type(1) .rangeNub{transform:rotate(135deg)}.rangeSlider.rsRange.rsVertical .rangeHandle:nth-of-type(2) .rangeNub{transform:rotate(-45deg)}.rangeSlider.rsRange.rsVertical.rsReversed .rangeHandle:nth-of-type(1) .rangeNub{transform:rotate(-45deg)}.rangeSlider.rsRange.rsVertical.rsReversed .rangeHandle:nth-of-type(2) .rangeNub{transform:rotate(135deg)}.rangeSlider .rangeFloat{display:block;position:absolute;left:50%;bottom:1.75em;font-size:1em;text-align:center;pointer-events:none;white-space:nowrap;font-size:0.9em;line-height:1;padding:0.33em 0.5em 0.5em;border-radius:0.5em;z-index:3;opacity:0;translate:-50% -50% 0.01px;scale:1;transform-origin:center;transition:all 0.22s cubic-bezier(0.33, 1, 0.68, 1)}.rangeSlider .rangeHandle.rsActive .rangeFloat,.rangeSlider.rsHoverable .rangeHandle:hover .rangeFloat,.rangeSlider.rsHoverable .rangeBar:hover .rangeFloat,.rangeSlider.rsFocus .rangeBar .rangeFloat{opacity:1;scale:1;translate:-50% 0% 0.01px}.rangeSlider .rangeBar .rangeFloat{bottom:0.875em;z-index:2}.rangeSlider.rsVertical .rangeFloat{top:50%;bottom:auto;left:auto;right:1.75em;translate:-50% -50% 0.01px}.rangeSlider.rsVertical .rangeHandle.rsActive .rangeFloat,.rangeSlider.rsVertical.rsHoverable .rangeHandle:hover .rangeFloat,.rangeSlider.rsVertical.rsHoverable .rangeBar:hover .rangeFloat,.rangeSlider.rsVertical.rsFocus .rangeBar .rangeFloat{translate:0% -50% 0.01px}.rangeSlider.rsVertical .rangeBar .rangeFloat{right:0.875em}.rangeSlider .rangeBar,.rangeSlider .rangeLimit,.rangeSlider.rsDrag .rangeBar::before{position:absolute;display:block;transition:background 0.2s ease;border-radius:1em;height:0.5em;top:0;user-select:none;z-index:1}.rangeSlider.rsVertical .rangeBar,.rangeSlider.rsVertical .rangeLimit,.rangeSlider.rsVertical.rsDrag .rangeBar::before{width:0.5em;height:auto}.rangeSlider .rangeBar{translate:calc((var(--slider-length) * (var(--range-start) / 100) * 1px)) 0;width:calc(var(--slider-length) * (var(--range-size) / 100 * 1px))}.rangeSlider.rsReversed .rangeBar{translate:calc((var(--slider-length) * 1px) - (var(--slider-length) * (var(--range-end) / 100) * 1px)) 0}.rangeSlider.rsVertical .rangeBar{translate:0 calc((var(--slider-length) * 1px) - (var(--slider-length) * (var(--range-end) / 100) * 1px));height:calc(var(--slider-length) * (var(--range-size) / 100 * 1px))}.rangeSlider.rsVertical.rsReversed .rangeBar{translate:0 calc((var(--slider-length) * (var(--range-start) / 100) * 1px))}.rangeSlider.rsDrag .rangeBar::before{content:'';inset:0;top:-0.5em;bottom:-0.5em;height:auto;background-color:var(--range-hover);opacity:0;scale:1 0.5;transition:opacity 0.2s ease,\n      scale 0.2s ease}.rangeSlider.rsVertical.rsDrag .rangeBar::before{inset:0;left:-0.5em;right:-0.5em;width:auto}.rangeSlider.rsHoverable:not(.rsDisabled).rsDrag .rangeBar:hover::before{opacity:0.2;scale:1 1}.rangeSlider.rsHoverable:not(.rsDisabled).rsDrag .rangeBar.rsPress::before{opacity:0.4;scale:1 1.25}.rangeSlider.rsVertical.rsHoverable:not(.rsDisabled).rsDrag .rangeBar.rsPress::before{scale:1.25 1}.rangeSlider{background-color:var(--slider)}.rangeSlider .rangeBar{background-color:var(--range-inactive)}.rangeSlider.rsFocus .rangeBar{background-color:var(--range)}.rangeSlider .rangeLimit{background-color:var(--range-limit)}.rangeSlider .rangeNub{background-color:var(--handle-inactive)}.rangeSlider.rsFocus .rangeNub{background-color:var(--handle)}.rangeSlider .rangeHandle.rsActive .rangeNub{background-color:var(--handle-focus)}.rangeSlider .rangeFloat{color:var(--float-text);background-color:var(--float-inactive)}.rangeSlider.rsFocus .rangeFloat{background-color:var(--float)}.rangeSlider.rsDisabled{opacity:0.5}.rangeSlider.rsDisabled .rangeNub{background-color:var(--handle-inactive)}.rangeSlider .rangeBar,.rangeSlider .rangeHandle{transition:opacity 0.2s ease}");
}
function get_if_ctx(ctx) {
  const child_ctx = ctx.slice();
  const constants_0 = (
    /*range*/
    child_ctx[11] === "min" ? (
      /*min*/
      child_ctx[1]
    ) : (
      /*values*/
      child_ctx[4][0]
    )
  );
  child_ctx[99] = constants_0;
  const constants_1 = (
    /*range*/
    child_ctx[11] === "max" ? (
      /*max*/
      child_ctx[2]
    ) : (
      /*range*/
      child_ctx[11] === "min" ? (
        /*values*/
        child_ctx[4][0]
      ) : (
        /*values*/
        child_ctx[4][1]
      )
    )
  );
  child_ctx[100] = constants_1;
  const constants_2 = (
    /*reversed*/
    child_ctx[16] ? [
      /*rangeMax*/
      child_ctx[100],
      /*rangeMin*/
      child_ctx[99]
    ] : [
      /*rangeMin*/
      child_ctx[99],
      /*rangeMax*/
      child_ctx[100]
    ]
  );
  child_ctx[31] = constants_2[0];
  child_ctx[101] = constants_2[1];
  return child_ctx;
}
function get_if_ctx_1(ctx) {
  const child_ctx = ctx.slice();
  const constants_0 = (
    /*rangeStartPercent*/
    child_ctx[44](
      /*$springPositions*/
      child_ctx[42]
    )
  );
  child_ctx[95] = constants_0;
  const constants_1 = (
    /*rangeEndPercent*/
    child_ctx[45](
      /*$springPositions*/
      child_ctx[42]
    )
  );
  child_ctx[96] = constants_1;
  const constants_2 = (
    /*rangeEnd*/
    child_ctx[96] - /*rangeStart*/
    child_ctx[95]
  );
  child_ctx[97] = constants_2;
  const constants_3 = (
    /*isMounted*/
    child_ctx[32] ? `` : `opacity: 0; `
  );
  child_ctx[98] = constants_3;
  return child_ctx;
}
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[9] = list[i];
  child_ctx[104] = i;
  const constants_0 = (
    /*focus*/
    child_ctx[33] && /*activeHandle*/
    child_ctx[36] === /*index*/
    child_ctx[104] ? `z-index: 3; ` : ``
  );
  child_ctx[102] = constants_0;
  const constants_1 = (
    /*isMounted*/
    child_ctx[32] ? `` : `opacity: 0; `
  );
  child_ctx[98] = constants_1;
  return child_ctx;
}
function get_if_ctx_2(ctx) {
  const child_ctx = ctx.slice();
  const constants_0 = valueAsPercent(
    /*value*/
    child_ctx[9],
    /*min*/
    child_ctx[1],
    /*max*/
    child_ctx[2],
    /*precision*/
    child_ctx[10]
  );
  child_ctx[105] = constants_0;
  const constants_1 = (
    /*handleFormatter*/
    child_ctx[6](
      /*value*/
      child_ctx[9],
      /*index*/
      child_ctx[104],
      /*percent*/
      child_ctx[105]
    )
  );
  child_ctx[106] = constants_1;
  return child_ctx;
}
function create_if_block_9(ctx) {
  let span;
  let if_block0_anchor;
  let html_tag;
  let raw_value = (
    /*formattedValue*/
    ctx[106] + ""
  );
  let html_anchor;
  let if_block0 = (
    /*prefix*/
    ctx[25] && create_if_block_11(ctx)
  );
  let if_block1 = (
    /*suffix*/
    ctx[26] && create_if_block_10(ctx)
  );
  return {
    c() {
      span = element("span");
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      html_tag = new HtmlTag(false);
      html_anchor = empty();
      if (if_block1) if_block1.c();
      html_tag.a = html_anchor;
      attr(span, "class", "rangeFloat");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      if (if_block0) if_block0.m(span, null);
      append(span, if_block0_anchor);
      html_tag.m(raw_value, span);
      append(span, html_anchor);
      if (if_block1) if_block1.m(span, null);
    },
    p(ctx2, dirty) {
      if (
        /*prefix*/
        ctx2[25]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_11(ctx2);
          if_block0.c();
          if_block0.m(span, if_block0_anchor);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (dirty[0] & /*handleFormatter, values, min, max, precision*/
      1110 && raw_value !== (raw_value = /*formattedValue*/
      ctx2[106] + "")) html_tag.p(raw_value);
      if (
        /*suffix*/
        ctx2[26]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_10(ctx2);
          if_block1.c();
          if_block1.m(span, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
    }
  };
}
function create_if_block_11(ctx) {
  let span;
  let t;
  return {
    c() {
      span = element("span");
      t = text(
        /*prefix*/
        ctx[25]
      );
      attr(span, "class", "rangeFloatPrefix");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*prefix*/
      33554432) set_data(
        t,
        /*prefix*/
        ctx2[25]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_if_block_10(ctx) {
  let span;
  let t;
  return {
    c() {
      span = element("span");
      t = text(
        /*suffix*/
        ctx[26]
      );
      attr(span, "class", "rangeFloatSuffix");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*suffix*/
      67108864) set_data(
        t,
        /*suffix*/
        ctx2[26]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_each_block(ctx) {
  let span1;
  let span0;
  let t;
  let span1_style_value;
  let span1_aria_label_value;
  let span1_aria_valuemin_value;
  let span1_aria_valuemax_value;
  let span1_aria_valuenow_value;
  let span1_aria_valuetext_value;
  let span1_aria_orientation_value;
  let span1_tabindex_value;
  let mounted;
  let dispose;
  let if_block = (
    /*float*/
    ctx[14] && create_if_block_9(get_if_ctx_2(ctx))
  );
  return {
    c() {
      span1 = element("span");
      span0 = element("span");
      t = space();
      if (if_block) if_block.c();
      attr(span0, "class", "rangeNub");
      attr(span1, "role", "slider");
      attr(span1, "class", "rangeHandle");
      attr(
        span1,
        "data-handle",
        /*index*/
        ctx[104]
      );
      attr(span1, "style", span1_style_value = `--handle-pos: ${/*$springPositions*/
      ctx[42][
        /*index*/
        ctx[104]
      ]};${/*zindex*/
      ctx[102]}${/*mountOpacity*/
      ctx[98]}`);
      attr(span1, "aria-label", span1_aria_label_value = /*ariaLabels*/
      ctx[8][
        /*index*/
        ctx[104]
      ]);
      attr(span1, "aria-valuemin", span1_aria_valuemin_value = /*range*/
      ctx[11] === true && /*index*/
      ctx[104] === 1 ? (
        /*values*/
        ctx[4][0]
      ) : (
        /*min*/
        ctx[1]
      ));
      attr(span1, "aria-valuemax", span1_aria_valuemax_value = /*range*/
      ctx[11] === true && /*index*/
      ctx[104] === 0 ? (
        /*values*/
        ctx[4][1]
      ) : (
        /*max*/
        ctx[2]
      ));
      attr(span1, "aria-valuenow", span1_aria_valuenow_value = /*value*/
      ctx[9]);
      attr(span1, "aria-valuetext", span1_aria_valuetext_value = /*ariaLabelFormatter*/
      ctx[56](
        /*value*/
        ctx[9],
        /*index*/
        ctx[104]
      ));
      attr(span1, "aria-orientation", span1_aria_orientation_value = /*vertical*/
      ctx[13] ? "vertical" : "horizontal");
      attr(
        span1,
        "aria-disabled",
        /*disabled*/
        ctx[18]
      );
      attr(span1, "tabindex", span1_tabindex_value = /*disabled*/
      ctx[18] ? -1 : 0);
      toggle_class(
        span1,
        "rsActive",
        /*focus*/
        ctx[33] && /*activeHandle*/
        ctx[36] === /*index*/
        ctx[104]
      );
      toggle_class(
        span1,
        "rsPress",
        /*handlePressed*/
        ctx[34] && /*activeHandle*/
        ctx[36] === /*index*/
        ctx[104]
      );
    },
    m(target, anchor) {
      insert(target, span1, anchor);
      append(span1, span0);
      append(span1, t);
      if (if_block) if_block.m(span1, null);
      if (!mounted) {
        dispose = [
          listen(
            span1,
            "blur",
            /*sliderBlurHandle*/
            ctx[46]
          ),
          listen(
            span1,
            "focus",
            /*sliderFocusHandle*/
            ctx[47]
          ),
          listen(
            span1,
            "keydown",
            /*sliderKeydown*/
            ctx[48]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (
        /*float*/
        ctx2[14]
      ) {
        if (if_block) {
          if_block.p(get_if_ctx_2(ctx2), dirty);
        } else {
          if_block = create_if_block_9(get_if_ctx_2(ctx2));
          if_block.c();
          if_block.m(span1, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty[1] & /*$springPositions, focus, activeHandle, isMounted*/
      2086 && span1_style_value !== (span1_style_value = `--handle-pos: ${/*$springPositions*/
      ctx2[42][
        /*index*/
        ctx2[104]
      ]};${/*zindex*/
      ctx2[102]}${/*mountOpacity*/
      ctx2[98]}`)) {
        attr(span1, "style", span1_style_value);
      }
      if (dirty[0] & /*ariaLabels*/
      256 && span1_aria_label_value !== (span1_aria_label_value = /*ariaLabels*/
      ctx2[8][
        /*index*/
        ctx2[104]
      ])) {
        attr(span1, "aria-label", span1_aria_label_value);
      }
      if (dirty[0] & /*range, values, min*/
      2066 && span1_aria_valuemin_value !== (span1_aria_valuemin_value = /*range*/
      ctx2[11] === true && /*index*/
      ctx2[104] === 1 ? (
        /*values*/
        ctx2[4][0]
      ) : (
        /*min*/
        ctx2[1]
      ))) {
        attr(span1, "aria-valuemin", span1_aria_valuemin_value);
      }
      if (dirty[0] & /*range, values, max*/
      2068 && span1_aria_valuemax_value !== (span1_aria_valuemax_value = /*range*/
      ctx2[11] === true && /*index*/
      ctx2[104] === 0 ? (
        /*values*/
        ctx2[4][1]
      ) : (
        /*max*/
        ctx2[2]
      ))) {
        attr(span1, "aria-valuemax", span1_aria_valuemax_value);
      }
      if (dirty[0] & /*values*/
      16 && span1_aria_valuenow_value !== (span1_aria_valuenow_value = /*value*/
      ctx2[9])) {
        attr(span1, "aria-valuenow", span1_aria_valuenow_value);
      }
      if (dirty[0] & /*values*/
      16 && span1_aria_valuetext_value !== (span1_aria_valuetext_value = /*ariaLabelFormatter*/
      ctx2[56](
        /*value*/
        ctx2[9],
        /*index*/
        ctx2[104]
      ))) {
        attr(span1, "aria-valuetext", span1_aria_valuetext_value);
      }
      if (dirty[0] & /*vertical*/
      8192 && span1_aria_orientation_value !== (span1_aria_orientation_value = /*vertical*/
      ctx2[13] ? "vertical" : "horizontal")) {
        attr(span1, "aria-orientation", span1_aria_orientation_value);
      }
      if (dirty[0] & /*disabled*/
      262144) {
        attr(
          span1,
          "aria-disabled",
          /*disabled*/
          ctx2[18]
        );
      }
      if (dirty[0] & /*disabled*/
      262144 && span1_tabindex_value !== (span1_tabindex_value = /*disabled*/
      ctx2[18] ? -1 : 0)) {
        attr(span1, "tabindex", span1_tabindex_value);
      }
      if (dirty[1] & /*focus, activeHandle*/
      36) {
        toggle_class(
          span1,
          "rsActive",
          /*focus*/
          ctx2[33] && /*activeHandle*/
          ctx2[36] === /*index*/
          ctx2[104]
        );
      }
      if (dirty[1] & /*handlePressed, activeHandle*/
      40) {
        toggle_class(
          span1,
          "rsPress",
          /*handlePressed*/
          ctx2[34] && /*activeHandle*/
          ctx2[36] === /*index*/
          ctx2[104]
        );
      }
    },
    d(detaching) {
      if (detaching) {
        detach(span1);
      }
      if (if_block) if_block.d();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_8(ctx) {
  let span;
  let span_style_value;
  return {
    c() {
      span = element("span");
      attr(span, "class", "rangeLimit");
      attr(span, "style", span_style_value = /*orientationStart*/
      ctx[40] + ": " + valueAsPercent(
        /*limits*/
        ctx[19][0],
        /*min*/
        ctx[1],
        /*max*/
        ctx[2],
        /*precision*/
        ctx[10]
      ) + "%; " + /*orientationEnd*/
      ctx[39] + ": " + (100 - valueAsPercent(
        /*limits*/
        ctx[19][1],
        /*min*/
        ctx[1],
        /*max*/
        ctx[2],
        /*precision*/
        ctx[10]
      )) + "%;");
    },
    m(target, anchor) {
      insert(target, span, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*limits, min, max, precision*/
      525318 | dirty[1] & /*orientationStart, orientationEnd*/
      768 && span_style_value !== (span_style_value = /*orientationStart*/
      ctx2[40] + ": " + valueAsPercent(
        /*limits*/
        ctx2[19][0],
        /*min*/
        ctx2[1],
        /*max*/
        ctx2[2],
        /*precision*/
        ctx2[10]
      ) + "%; " + /*orientationEnd*/
      ctx2[39] + ": " + (100 - valueAsPercent(
        /*limits*/
        ctx2[19][1],
        /*min*/
        ctx2[1],
        /*max*/
        ctx2[2],
        /*precision*/
        ctx2[10]
      )) + "%;")) {
        attr(span, "style", span_style_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_if_block_1(ctx) {
  let span;
  let span_style_value;
  let if_block = (
    /*rangeFloat*/
    ctx[15] && create_if_block_2(get_if_ctx(ctx))
  );
  return {
    c() {
      span = element("span");
      if (if_block) if_block.c();
      attr(span, "class", "rangeBar");
      attr(span, "style", span_style_value = `--range-start:${/*rangeStart*/
      ctx[95]};--range-end:${/*rangeEnd*/
      ctx[96]};--range-size:${/*rangeSize*/
      ctx[97]};${/*mountOpacity*/
      ctx[98]};`);
      toggle_class(
        span,
        "rsPress",
        /*rangePressed*/
        ctx[35]
      );
    },
    m(target, anchor) {
      insert(target, span, anchor);
      if (if_block) if_block.m(span, null);
    },
    p(ctx2, dirty) {
      if (
        /*rangeFloat*/
        ctx2[15]
      ) {
        if (if_block) {
          if_block.p(get_if_ctx(ctx2), dirty);
        } else {
          if_block = create_if_block_2(get_if_ctx(ctx2));
          if_block.c();
          if_block.m(span, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty[1] & /*$springPositions, isMounted*/
      2050 && span_style_value !== (span_style_value = `--range-start:${/*rangeStart*/
      ctx2[95]};--range-end:${/*rangeEnd*/
      ctx2[96]};--range-size:${/*rangeSize*/
      ctx2[97]};${/*mountOpacity*/
      ctx2[98]};`)) {
        attr(span, "style", span_style_value);
      }
      if (dirty[1] & /*rangePressed*/
      16) {
        toggle_class(
          span,
          "rsPress",
          /*rangePressed*/
          ctx2[35]
        );
      }
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
      if (if_block) if_block.d();
    }
  };
}
function create_if_block_2(ctx) {
  let span;
  function select_block_type(ctx2, dirty) {
    if (
      /*rangeFormatter*/
      ctx2[7]
    ) return create_if_block_3;
    return create_else_block;
  }
  let current_block_type = select_block_type(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      span = element("span");
      if_block.c();
      attr(span, "class", "rangeFloat");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      if_block.m(span, null);
    },
    p(ctx2, dirty) {
      if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(span, null);
        }
      }
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
      if_block.d();
    }
  };
}
function create_else_block(ctx) {
  let if_block0_anchor;
  let html_tag;
  let raw0_value = (
    /*first*/
    ctx[31] + ""
  );
  let html_anchor;
  let t0;
  let t1_value = " ";
  let t1;
  let t2;
  let t3_value = " ";
  let t3;
  let t4;
  let if_block2_anchor;
  let html_tag_1;
  let raw1_value = (
    /*second*/
    ctx[101] + ""
  );
  let html_anchor_1;
  let if_block3_anchor;
  let if_block0 = (
    /*prefix*/
    ctx[25] && create_if_block_7(ctx)
  );
  let if_block1 = (
    /*suffix*/
    ctx[26] && create_if_block_6(ctx)
  );
  let if_block2 = (
    /*prefix*/
    ctx[25] && create_if_block_5(ctx)
  );
  let if_block3 = (
    /*suffix*/
    ctx[26] && create_if_block_4(ctx)
  );
  return {
    c() {
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      html_tag = new HtmlTag(false);
      html_anchor = empty();
      if (if_block1) if_block1.c();
      t0 = space();
      t1 = text(t1_value);
      t2 = text("-");
      t3 = text(t3_value);
      t4 = space();
      if (if_block2) if_block2.c();
      if_block2_anchor = empty();
      html_tag_1 = new HtmlTag(false);
      html_anchor_1 = empty();
      if (if_block3) if_block3.c();
      if_block3_anchor = empty();
      html_tag.a = html_anchor;
      html_tag_1.a = html_anchor_1;
    },
    m(target, anchor) {
      if (if_block0) if_block0.m(target, anchor);
      insert(target, if_block0_anchor, anchor);
      html_tag.m(raw0_value, target, anchor);
      insert(target, html_anchor, anchor);
      if (if_block1) if_block1.m(target, anchor);
      insert(target, t0, anchor);
      insert(target, t1, anchor);
      insert(target, t2, anchor);
      insert(target, t3, anchor);
      insert(target, t4, anchor);
      if (if_block2) if_block2.m(target, anchor);
      insert(target, if_block2_anchor, anchor);
      html_tag_1.m(raw1_value, target, anchor);
      insert(target, html_anchor_1, anchor);
      if (if_block3) if_block3.m(target, anchor);
      insert(target, if_block3_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (
        /*prefix*/
        ctx2[25]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_7(ctx2);
          if_block0.c();
          if_block0.m(if_block0_anchor.parentNode, if_block0_anchor);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (dirty[0] & /*reversed, range, max, values, min*/
      67606 && raw0_value !== (raw0_value = /*first*/
      ctx2[31] + "")) html_tag.p(raw0_value);
      if (
        /*suffix*/
        ctx2[26]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_6(ctx2);
          if_block1.c();
          if_block1.m(t0.parentNode, t0);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (
        /*prefix*/
        ctx2[25]
      ) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
        } else {
          if_block2 = create_if_block_5(ctx2);
          if_block2.c();
          if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
      if (dirty[0] & /*reversed, range, max, values, min*/
      67606 && raw1_value !== (raw1_value = /*second*/
      ctx2[101] + "")) html_tag_1.p(raw1_value);
      if (
        /*suffix*/
        ctx2[26]
      ) {
        if (if_block3) {
          if_block3.p(ctx2, dirty);
        } else {
          if_block3 = create_if_block_4(ctx2);
          if_block3.c();
          if_block3.m(if_block3_anchor.parentNode, if_block3_anchor);
        }
      } else if (if_block3) {
        if_block3.d(1);
        if_block3 = null;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(if_block0_anchor);
        detach(html_anchor);
        html_tag.d();
        detach(t0);
        detach(t1);
        detach(t2);
        detach(t3);
        detach(t4);
        detach(if_block2_anchor);
        detach(html_anchor_1);
        html_tag_1.d();
        detach(if_block3_anchor);
      }
      if (if_block0) if_block0.d(detaching);
      if (if_block1) if_block1.d(detaching);
      if (if_block2) if_block2.d(detaching);
      if (if_block3) if_block3.d(detaching);
    }
  };
}
function create_if_block_3(ctx) {
  let html_tag;
  let raw_value = (
    /*rangeFormatter*/
    ctx[7](
      /*first*/
      ctx[31],
      /*second*/
      ctx[101],
      valueAsPercent(
        /*first*/
        ctx[31],
        /*min*/
        ctx[1],
        /*max*/
        ctx[2],
        /*precision*/
        ctx[10]
      ),
      valueAsPercent(
        /*second*/
        ctx[101],
        /*min*/
        ctx[1],
        /*max*/
        ctx[2],
        /*precision*/
        ctx[10]
      )
    ) + ""
  );
  let html_anchor;
  return {
    c() {
      html_tag = new HtmlTag(false);
      html_anchor = empty();
      html_tag.a = html_anchor;
    },
    m(target, anchor) {
      html_tag.m(raw_value, target, anchor);
      insert(target, html_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*rangeFormatter, reversed, range, max, values, min, precision*/
      68758 && raw_value !== (raw_value = /*rangeFormatter*/
      ctx2[7](
        /*first*/
        ctx2[31],
        /*second*/
        ctx2[101],
        valueAsPercent(
          /*first*/
          ctx2[31],
          /*min*/
          ctx2[1],
          /*max*/
          ctx2[2],
          /*precision*/
          ctx2[10]
        ),
        valueAsPercent(
          /*second*/
          ctx2[101],
          /*min*/
          ctx2[1],
          /*max*/
          ctx2[2],
          /*precision*/
          ctx2[10]
        )
      ) + "")) html_tag.p(raw_value);
    },
    d(detaching) {
      if (detaching) {
        detach(html_anchor);
        html_tag.d();
      }
    }
  };
}
function create_if_block_7(ctx) {
  let span;
  let t;
  return {
    c() {
      span = element("span");
      t = text(
        /*prefix*/
        ctx[25]
      );
      attr(span, "class", "rangeFloatPrefix");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*prefix*/
      33554432) set_data(
        t,
        /*prefix*/
        ctx2[25]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_if_block_6(ctx) {
  let span;
  let t;
  return {
    c() {
      span = element("span");
      t = text(
        /*suffix*/
        ctx[26]
      );
      attr(span, "class", "rangeFloatSuffix");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*suffix*/
      67108864) set_data(
        t,
        /*suffix*/
        ctx2[26]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_if_block_5(ctx) {
  let span;
  let t;
  return {
    c() {
      span = element("span");
      t = text(
        /*prefix*/
        ctx[25]
      );
      attr(span, "class", "rangeFloatPrefix");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*prefix*/
      33554432) set_data(
        t,
        /*prefix*/
        ctx2[25]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_if_block_4(ctx) {
  let span;
  let t;
  return {
    c() {
      span = element("span");
      t = text(
        /*suffix*/
        ctx[26]
      );
      attr(span, "class", "rangeFloatSuffix");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*suffix*/
      67108864) set_data(
        t,
        /*suffix*/
        ctx2[26]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_if_block(ctx) {
  let rangepips;
  let current;
  rangepips = new RangePips({
    props: {
      values: (
        /*values*/
        ctx[4]
      ),
      min: (
        /*min*/
        ctx[1]
      ),
      max: (
        /*max*/
        ctx[2]
      ),
      step: (
        /*step*/
        ctx[3]
      ),
      range: (
        /*range*/
        ctx[11]
      ),
      vertical: (
        /*vertical*/
        ctx[13]
      ),
      reversed: (
        /*reversed*/
        ctx[16]
      ),
      orientationStart: (
        /*orientationStart*/
        ctx[40]
      ),
      hoverable: (
        /*hoverable*/
        ctx[17]
      ),
      disabled: (
        /*disabled*/
        ctx[18]
      ),
      limits: (
        /*limits*/
        ctx[19]
      ),
      all: (
        /*all*/
        ctx[22]
      ),
      first: (
        /*first*/
        ctx[31]
      ),
      last: (
        /*last*/
        ctx[23]
      ),
      rest: (
        /*rest*/
        ctx[24]
      ),
      pipstep: (
        /*pipstep*/
        ctx[21]
      ),
      prefix: (
        /*prefix*/
        ctx[25]
      ),
      suffix: (
        /*suffix*/
        ctx[26]
      ),
      formatter: (
        /*formatter*/
        ctx[5]
      ),
      precision: (
        /*precision*/
        ctx[10]
      ),
      focus: (
        /*focus*/
        ctx[33]
      ),
      moveHandle: (
        /*moveHandle*/
        ctx[43]
      )
    }
  });
  return {
    c() {
      create_component(rangepips.$$.fragment);
    },
    m(target, anchor) {
      mount_component(rangepips, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const rangepips_changes = {};
      if (dirty[0] & /*values*/
      16) rangepips_changes.values = /*values*/
      ctx2[4];
      if (dirty[0] & /*min*/
      2) rangepips_changes.min = /*min*/
      ctx2[1];
      if (dirty[0] & /*max*/
      4) rangepips_changes.max = /*max*/
      ctx2[2];
      if (dirty[0] & /*step*/
      8) rangepips_changes.step = /*step*/
      ctx2[3];
      if (dirty[0] & /*range*/
      2048) rangepips_changes.range = /*range*/
      ctx2[11];
      if (dirty[0] & /*vertical*/
      8192) rangepips_changes.vertical = /*vertical*/
      ctx2[13];
      if (dirty[0] & /*reversed*/
      65536) rangepips_changes.reversed = /*reversed*/
      ctx2[16];
      if (dirty[1] & /*orientationStart*/
      512) rangepips_changes.orientationStart = /*orientationStart*/
      ctx2[40];
      if (dirty[0] & /*hoverable*/
      131072) rangepips_changes.hoverable = /*hoverable*/
      ctx2[17];
      if (dirty[0] & /*disabled*/
      262144) rangepips_changes.disabled = /*disabled*/
      ctx2[18];
      if (dirty[0] & /*limits*/
      524288) rangepips_changes.limits = /*limits*/
      ctx2[19];
      if (dirty[0] & /*all*/
      4194304) rangepips_changes.all = /*all*/
      ctx2[22];
      if (dirty[1] & /*first*/
      1) rangepips_changes.first = /*first*/
      ctx2[31];
      if (dirty[0] & /*last*/
      8388608) rangepips_changes.last = /*last*/
      ctx2[23];
      if (dirty[0] & /*rest*/
      16777216) rangepips_changes.rest = /*rest*/
      ctx2[24];
      if (dirty[0] & /*pipstep*/
      2097152) rangepips_changes.pipstep = /*pipstep*/
      ctx2[21];
      if (dirty[0] & /*prefix*/
      33554432) rangepips_changes.prefix = /*prefix*/
      ctx2[25];
      if (dirty[0] & /*suffix*/
      67108864) rangepips_changes.suffix = /*suffix*/
      ctx2[26];
      if (dirty[0] & /*formatter*/
      32) rangepips_changes.formatter = /*formatter*/
      ctx2[5];
      if (dirty[0] & /*precision*/
      1024) rangepips_changes.precision = /*precision*/
      ctx2[10];
      if (dirty[1] & /*focus*/
      4) rangepips_changes.focus = /*focus*/
      ctx2[33];
      rangepips.$set(rangepips_changes);
    },
    i(local) {
      if (current) return;
      transition_in(rangepips.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(rangepips.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(rangepips, detaching);
    }
  };
}
function create_fragment(ctx) {
  let div2;
  let t0;
  let t1;
  let t2;
  let div_class_value;
  let div_style_value;
  let current;
  let mounted;
  let dispose;
  let each_value = ensure_array_like(
    /*values*/
    ctx[4]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  let if_block0 = (
    /*limits*/
    ctx[19] && create_if_block_8(ctx)
  );
  let if_block1 = (
    /*hasRange*/
    ctx[41] && create_if_block_1(get_if_ctx_1(ctx))
  );
  let if_block2 = (
    /*pips*/
    ctx[20] && create_if_block(ctx)
  );
  return {
    c() {
      div2 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t0 = space();
      if (if_block0) if_block0.c();
      t1 = space();
      if (if_block1) if_block1.c();
      t2 = space();
      if (if_block2) if_block2.c();
      attr(
        div2,
        "id",
        /*id*/
        ctx[27]
      );
      attr(div2, "role", "none");
      attr(div2, "class", div_class_value = "rangeSlider " + /*classes*/
      ctx[28]);
      attr(div2, "style", div_style_value = `--slider-length: ${/*sliderSize*/
      ctx[37]};${/*style*/
      ctx[29] ?? ""}`);
      toggle_class(
        div2,
        "rsDark",
        /*darkmode*/
        ctx[30] === "force"
      );
      toggle_class(
        div2,
        "rsAutoDark",
        /*darkmode*/
        ctx[30] === "auto"
      );
      toggle_class(
        div2,
        "rsRange",
        /*hasRange*/
        ctx[41]
      );
      toggle_class(
        div2,
        "rsDrag",
        /*hasRange*/
        ctx[41] && /*draggy*/
        ctx[12]
      );
      toggle_class(
        div2,
        "rsMin",
        /*hasRange*/
        ctx[41] && /*range*/
        ctx[11] === "min"
      );
      toggle_class(
        div2,
        "rsMax",
        /*hasRange*/
        ctx[41] && /*range*/
        ctx[11] === "max"
      );
      toggle_class(
        div2,
        "rsDisabled",
        /*disabled*/
        ctx[18]
      );
      toggle_class(
        div2,
        "rsHoverable",
        /*hoverable*/
        ctx[17]
      );
      toggle_class(
        div2,
        "rsVertical",
        /*vertical*/
        ctx[13]
      );
      toggle_class(
        div2,
        "rsReversed",
        /*reversed*/
        ctx[16]
      );
      toggle_class(
        div2,
        "rsFocus",
        /*focus*/
        ctx[33]
      );
      toggle_class(
        div2,
        "rsPips",
        /*pips*/
        ctx[20]
      );
      toggle_class(
        div2,
        "rsPipLabels",
        /*all*/
        ctx[22] === "label" || /*first*/
        ctx[31] === "label" || /*last*/
        ctx[23] === "label" || /*rest*/
        ctx[24] === "label"
      );
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div2, null);
        }
      }
      append(div2, t0);
      if (if_block0) if_block0.m(div2, null);
      append(div2, t1);
      if (if_block1) if_block1.m(div2, null);
      append(div2, t2);
      if (if_block2) if_block2.m(div2, null);
      ctx[63](div2);
      current = true;
      if (!mounted) {
        dispose = [
          listen(
            window,
            "mousedown",
            /*bodyInteractStart*/
            ctx[51]
          ),
          listen(
            window,
            "touchstart",
            /*bodyInteractStart*/
            ctx[51]
          ),
          listen(
            window,
            "mousemove",
            /*bodyInteract*/
            ctx[52]
          ),
          listen(
            window,
            "touchmove",
            /*bodyInteract*/
            ctx[52]
          ),
          listen(
            window,
            "mouseup",
            /*bodyMouseUp*/
            ctx[53]
          ),
          listen(
            window,
            "touchend",
            /*bodyTouchEnd*/
            ctx[54]
          ),
          listen(
            window,
            "keydown",
            /*bodyKeyDown*/
            ctx[55]
          ),
          listen(
            div2,
            "mousedown",
            /*sliderInteractStart*/
            ctx[49]
          ),
          listen(
            div2,
            "mouseup",
            /*sliderInteractEnd*/
            ctx[50]
          ),
          listen(div2, "touchstart", prevent_default(
            /*sliderInteractStart*/
            ctx[49]
          )),
          listen(div2, "touchend", prevent_default(
            /*sliderInteractEnd*/
            ctx[50]
          ))
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*ariaLabels, range, values, min, max, vertical, disabled, suffix, handleFormatter, precision, prefix, float*/
      100953430 | dirty[1] & /*$springPositions, focus, activeHandle, isMounted, ariaLabelFormatter, handlePressed, sliderBlurHandle, sliderFocusHandle, sliderKeydown*/
      33785902) {
        each_value = ensure_array_like(
          /*values*/
          ctx2[4]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(div2, t0);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (
        /*limits*/
        ctx2[19]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_8(ctx2);
          if_block0.c();
          if_block0.m(div2, t1);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (
        /*hasRange*/
        ctx2[41]
      ) {
        if (if_block1) {
          if_block1.p(get_if_ctx_1(ctx2), dirty);
        } else {
          if_block1 = create_if_block_1(get_if_ctx_1(ctx2));
          if_block1.c();
          if_block1.m(div2, t2);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (
        /*pips*/
        ctx2[20]
      ) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
          if (dirty[0] & /*pips*/
          1048576) {
            transition_in(if_block2, 1);
          }
        } else {
          if_block2 = create_if_block(ctx2);
          if_block2.c();
          transition_in(if_block2, 1);
          if_block2.m(div2, null);
        }
      } else if (if_block2) {
        group_outros();
        transition_out(if_block2, 1, 1, () => {
          if_block2 = null;
        });
        check_outros();
      }
      if (!current || dirty[0] & /*id*/
      134217728) {
        attr(
          div2,
          "id",
          /*id*/
          ctx2[27]
        );
      }
      if (!current || dirty[0] & /*classes*/
      268435456 && div_class_value !== (div_class_value = "rangeSlider " + /*classes*/
      ctx2[28])) {
        attr(div2, "class", div_class_value);
      }
      if (!current || dirty[0] & /*style*/
      536870912 | dirty[1] & /*sliderSize*/
      64 && div_style_value !== (div_style_value = `--slider-length: ${/*sliderSize*/
      ctx2[37]};${/*style*/
      ctx2[29] ?? ""}`)) {
        attr(div2, "style", div_style_value);
      }
      if (!current || dirty[0] & /*classes, darkmode*/
      1342177280) {
        toggle_class(
          div2,
          "rsDark",
          /*darkmode*/
          ctx2[30] === "force"
        );
      }
      if (!current || dirty[0] & /*classes, darkmode*/
      1342177280) {
        toggle_class(
          div2,
          "rsAutoDark",
          /*darkmode*/
          ctx2[30] === "auto"
        );
      }
      if (!current || dirty[0] & /*classes*/
      268435456 | dirty[1] & /*hasRange*/
      1024) {
        toggle_class(
          div2,
          "rsRange",
          /*hasRange*/
          ctx2[41]
        );
      }
      if (!current || dirty[0] & /*classes, draggy*/
      268439552 | dirty[1] & /*hasRange*/
      1024) {
        toggle_class(
          div2,
          "rsDrag",
          /*hasRange*/
          ctx2[41] && /*draggy*/
          ctx2[12]
        );
      }
      if (!current || dirty[0] & /*classes, range*/
      268437504 | dirty[1] & /*hasRange*/
      1024) {
        toggle_class(
          div2,
          "rsMin",
          /*hasRange*/
          ctx2[41] && /*range*/
          ctx2[11] === "min"
        );
      }
      if (!current || dirty[0] & /*classes, range*/
      268437504 | dirty[1] & /*hasRange*/
      1024) {
        toggle_class(
          div2,
          "rsMax",
          /*hasRange*/
          ctx2[41] && /*range*/
          ctx2[11] === "max"
        );
      }
      if (!current || dirty[0] & /*classes, disabled*/
      268697600) {
        toggle_class(
          div2,
          "rsDisabled",
          /*disabled*/
          ctx2[18]
        );
      }
      if (!current || dirty[0] & /*classes, hoverable*/
      268566528) {
        toggle_class(
          div2,
          "rsHoverable",
          /*hoverable*/
          ctx2[17]
        );
      }
      if (!current || dirty[0] & /*classes, vertical*/
      268443648) {
        toggle_class(
          div2,
          "rsVertical",
          /*vertical*/
          ctx2[13]
        );
      }
      if (!current || dirty[0] & /*classes, reversed*/
      268500992) {
        toggle_class(
          div2,
          "rsReversed",
          /*reversed*/
          ctx2[16]
        );
      }
      if (!current || dirty[0] & /*classes*/
      268435456 | dirty[1] & /*focus*/
      4) {
        toggle_class(
          div2,
          "rsFocus",
          /*focus*/
          ctx2[33]
        );
      }
      if (!current || dirty[0] & /*classes, pips*/
      269484032) {
        toggle_class(
          div2,
          "rsPips",
          /*pips*/
          ctx2[20]
        );
      }
      if (!current || dirty[0] & /*classes, all, last, rest*/
      297795584 | dirty[1] & /*first*/
      1) {
        toggle_class(
          div2,
          "rsPipLabels",
          /*all*/
          ctx2[22] === "label" || /*first*/
          ctx2[31] === "label" || /*last*/
          ctx2[23] === "label" || /*rest*/
          ctx2[24] === "label"
        );
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block2);
      current = true;
    },
    o(local) {
      transition_out(if_block2);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div2);
      }
      destroy_each(each_blocks, detaching);
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
      if (if_block2) if_block2.d();
      ctx[63](null);
      mounted = false;
      run_all(dispose);
    }
  };
}
function trimRange(values, range) {
  if (range === "min" || range === "max") {
    return values.slice(0, 1);
  } else if (range) {
    return values.slice(0, 2);
  } else {
    return values;
  }
}
function instance($$self, $$props, $$invalidate) {
  let hasRange;
  let orientationStart;
  let orientationEnd;
  let $springPositions, $$unsubscribe_springPositions = noop, $$subscribe_springPositions = () => ($$unsubscribe_springPositions(), $$unsubscribe_springPositions = subscribe(springPositions, ($$value) => $$invalidate(42, $springPositions = $$value)), springPositions);
  $$self.$$.on_destroy.push(() => $$unsubscribe_springPositions());
  let { slider = void 0 } = $$props;
  let { precision = 2 } = $$props;
  let { range = false } = $$props;
  let { pushy = false } = $$props;
  let { draggy = false } = $$props;
  let { min: min2 = 0 } = $$props;
  let { max: max2 = 100 } = $$props;
  let { step = 1 } = $$props;
  let { values = [coerceFloat((max2 + min2) / 2, precision)] } = $$props;
  let { value = values[0] } = $$props;
  let { vertical = false } = $$props;
  let { float = false } = $$props;
  let { rangeFloat = false } = $$props;
  let { reversed = false } = $$props;
  let { hoverable = true } = $$props;
  let { disabled = false } = $$props;
  let { limits = null } = $$props;
  let { rangeGapMin = 0 } = $$props;
  let { rangeGapMax = Infinity } = $$props;
  let { pips = false } = $$props;
  let { pipstep = void 0 } = $$props;
  let { all = true } = $$props;
  let { first = void 0 } = $$props;
  let { last = void 0 } = $$props;
  let { rest = void 0 } = $$props;
  let { prefix = "" } = $$props;
  let { suffix = "" } = $$props;
  let { formatter = (v, i, p) => v } = $$props;
  let { handleFormatter = formatter } = $$props;
  let { rangeFormatter = null } = $$props;
  let { ariaLabels = [] } = $$props;
  let { id = void 0 } = $$props;
  let { class: classes = "" } = $$props;
  let { style = void 0 } = $$props;
  let { darkmode = false } = $$props;
  let { springValues = { stiffness: 0.15, damping: 0.4 } } = $$props;
  let { spring: spring$1 = true } = $$props;
  const dispatch = createEventDispatcher();
  let isMounted = false;
  let valueLength = 0;
  let focus = false;
  let handleActivated = false;
  let handlePressed = false;
  let rangeActivated = false;
  let rangePressed = false;
  let rangeDistancesFromPointer = [1, 1];
  let keyboardActive = false;
  let activeHandle = -1;
  let startValues = [];
  let previousValues = [];
  let sliderSize = 0;
  let springPositions;
  const updateValues = () => {
    checkValuesIsArray();
    if (values[0] !== value) {
      $$invalidate(4, values[0] = value, values);
    }
  };
  const updateValue = () => {
    checkValueIsNumber();
    if (value !== values[0]) {
      $$invalidate(9, value = values[0]);
    }
  };
  const checkMinMax = () => {
    if (!isFiniteNumber(min2)) {
      $$invalidate(1, min2 = 0);
      console.error("'min' prop must be a valid finite Number");
    }
    if (!isFiniteNumber(max2)) {
      $$invalidate(2, max2 = 100);
      console.error("'max' prop must be a valid finite Number");
    }
    if (min2 >= max2) {
      $$invalidate(1, min2 = 0);
      $$invalidate(2, max2 = 100);
      console.error("'min' prop should be less than 'max'");
    }
    $$invalidate(1, min2 = coerceFloat(min2, precision));
    $$invalidate(2, max2 = coerceFloat(max2, precision));
  };
  const checkValueIsNumber = () => {
    if (!isFiniteNumber(value)) {
      $$invalidate(9, value = (max2 + min2) / 2);
      console.error("'value' prop should be a Number");
    }
  };
  const checkValuesIsArray = () => {
    if (!Array.isArray(values)) {
      $$invalidate(4, values = [value]);
      console.error("'values' prop should be an Array");
    } else if (values.some((v) => !isFiniteNumber(v))) {
      $$invalidate(4, values = values.map((v) => isFiniteNumber(v) ? v : (max2 + min2) / 2));
      console.error("'values' prop should be an Array of Numbers");
    }
  };
  const checkStep = () => {
    if (!isFiniteNumber(step) || step <= 0) {
      $$invalidate(3, step = 1);
      console.error("'step' prop must be a positive Number");
    }
  };
  const checkAriaLabels = () => {
    if (values.length > 1 && !Array.isArray(ariaLabels)) {
      $$invalidate(8, ariaLabels = []);
      console.warn(`'ariaLabels' prop should be an Array`);
    }
  };
  const checkValuesAgainstRangeGaps = () => {
    $$invalidate(4, values = values.map((v) => constrainAndAlignValue(v, min2, max2, step, precision, limits)));
    if (rangeGapMin < 0) $$invalidate(57, rangeGapMin = 0);
    if (rangeGapMax < 0) $$invalidate(58, rangeGapMax = Infinity);
    if (rangeGapMin > rangeGapMax) $$invalidate(57, rangeGapMin = rangeGapMax);
    if (rangeGapMax < Infinity) {
      const gapMax = constrainAndAlignValue(values[0] + rangeGapMax, min2, max2, step, precision, limits);
      if (values[1] > gapMax) {
        $$invalidate(4, values[1] = gapMax, values);
      }
    }
    if (rangeGapMin > 0) {
      const gapMin = constrainAndAlignValue(values[0] + rangeGapMin, min2, max2, step, precision, limits);
      if (values[1] < gapMin) {
        $$invalidate(4, values[1] = gapMin, values);
      }
    }
  };
  const checkFormatters = () => {
    if (formatter === null || formatter === void 0) {
      console.error("formatter must be a function");
      $$invalidate(5, formatter = (v, i, p) => v);
    }
    if (handleFormatter === null || handleFormatter === void 0) {
      console.error("handleFormatter must be a function");
      $$invalidate(6, handleFormatter = formatter);
    }
    if (rangeFormatter === void 0) {
      console.error("rangeFormatter must be a function, or null");
      $$invalidate(7, rangeFormatter = null);
    }
  };
  checkMinMax();
  checkValueIsNumber();
  checkValuesIsArray();
  checkStep();
  checkValuesAgainstRangeGaps();
  checkFormatters();
  const createSpring = (values2) => {
    $$subscribe_springPositions($$invalidate(38, springPositions = spring(values2.map((v) => valueAsPercent(v, min2, max2)), springValues)));
  };
  const updateSpring = (values2) => {
    requestAnimationFrame(() => {
      springPositions.set(values2.map((v) => valueAsPercent(v, min2, max2)), { hard: !spring$1 });
    });
  };
  const updateSpringValues = () => {
    if (springPositions) {
      $$subscribe_springPositions($$invalidate(38, springPositions.stiffness = springValues.stiffness ?? 0.15, springPositions));
      $$subscribe_springPositions($$invalidate(38, springPositions.damping = springValues.damping ?? 0.4, springPositions));
    }
  };
  function updateSliderSize(slider2) {
    return requestAnimationFrame(() => {
      if (slider2) {
        const dims = slider2.getBoundingClientRect();
        $$invalidate(37, sliderSize = vertical ? dims.height : dims.width);
      }
    });
  }
  let resizeObserver;
  let rafId;
  onMount2(() => {
    if (slider) {
      resizeObserver = new ResizeObserver((entries2) => {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        rafId = updateSliderSize(entries2[0].target);
      });
      resizeObserver.observe(slider);
      setTimeout(
        () => {
          $$invalidate(32, isMounted = true);
        },
        16
      );
    }
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver?.disconnect?.();
      $$invalidate(32, isMounted = false);
    };
  });
  function targetIsHandle(el) {
    if (!slider) return false;
    const handles = slider.querySelectorAll(".handle");
    const isHandle = Array.prototype.includes.call(handles, el);
    const isChild = Array.prototype.some.call(handles, (e) => e.contains(el));
    return isHandle || isChild;
  }
  function getClosestHandle(clientPos) {
    if (!slider) return 0;
    const { pointerVal: clickedVal } = calculatePointerValues(slider, clientPos, vertical, reversed, min2, max2);
    let closest = 0;
    if (range === true && values[0] === values[1]) {
      if (clickedVal > values[1]) {
        closest = 1;
      } else {
        closest = 0;
      }
    } else {
      closest = values.indexOf([...values].sort((a, b) => Math.abs(clickedVal - a) - Math.abs(clickedVal - b))[0]);
    }
    return closest;
  }
  function handleInteract(clientPos) {
    if (!slider || !handleActivated) return;
    const { pointerVal: handleVal } = calculatePointerValues(slider, clientPos, vertical, reversed, min2, max2);
    moveHandle(activeHandle, handleVal);
  }
  function getRangeDistancesOnInteractionStart(clientPos) {
    if (!slider || !draggy || !rangeActivated || range === "min" || range === "max") return;
    const { pointerVal } = calculatePointerValues(slider, clientPos, vertical, reversed, min2, max2);
    rangeDistancesFromPointer = [values[0] - pointerVal, values[1] - pointerVal];
  }
  function rangeInteract(clientPos) {
    if (!slider || !draggy || !rangeActivated || range === "min" || range === "max") return;
    const { pointerVal } = calculatePointerValues(slider, clientPos, vertical, reversed, min2, max2);
    $$invalidate(36, activeHandle = -1);
    moveHandle(0, pointerVal + rangeDistancesFromPointer[0], false);
    moveHandle(1, pointerVal + rangeDistancesFromPointer[1], true);
  }
  function moveHandle(index, value2, fireEvent = true) {
    value2 = constrainAndAlignValue(value2, min2, max2, step, precision, limits);
    if (index === null) {
      index = activeHandle;
    }
    if (range === true) {
      if (index === 0) {
        if (value2 > values[1] - rangeGapMin) {
          if (pushy && value2 <= (limits?.[1] ?? max2) - rangeGapMin) {
            $$invalidate(4, values[1] = value2 + rangeGapMin, values);
          } else {
            value2 = values[1] - rangeGapMin;
          }
        } else if (value2 < values[1] - rangeGapMax) {
          if (pushy) {
            $$invalidate(4, values[1] = value2 + rangeGapMax, values);
          } else {
            value2 = values[1] - rangeGapMax;
          }
        }
      } else if (index === 1) {
        if (value2 < values[0] + rangeGapMin) {
          if (pushy && value2 >= (limits?.[0] ?? min2) + rangeGapMin) {
            $$invalidate(4, values[0] = value2 - rangeGapMin, values);
          } else {
            value2 = values[0] + rangeGapMin;
          }
        } else if (value2 > values[0] + rangeGapMax) {
          if (pushy) {
            $$invalidate(4, values[0] = value2 - rangeGapMax, values);
          } else {
            value2 = values[0] + rangeGapMax;
          }
        }
      }
    }
    if (values[index] !== value2) {
      $$invalidate(4, values[index] = constrainAndAlignValue(value2, min2, max2, step, precision, limits), values);
    }
    if (fireEvent) {
      fireChangeEvent(values);
    }
    return value2;
  }
  function fireChangeEvent(values2) {
    const hasChanged = previousValues.some((prev, index) => {
      return prev !== values2[index];
    });
    if (hasChanged) {
      eChange();
      previousValues = [...values2];
    }
  }
  function rangeStartPercent(values2) {
    if (range === "min") {
      return 0;
    } else {
      return values2[0];
    }
  }
  function rangeEndPercent(values2) {
    if (range === "max") {
      return 100;
    } else if (range === "min") {
      return values2[0];
    } else {
      return values2[1];
    }
  }
  function sliderBlurHandle(event) {
    event.target;
    if (keyboardActive) {
      $$invalidate(33, focus = false);
      handleActivated = false;
      $$invalidate(34, handlePressed = false);
      rangeActivated = false;
      $$invalidate(35, rangePressed = false);
    }
  }
  function sliderFocusHandle(event) {
    const target = event.target;
    if (!disabled) {
      $$invalidate(36, activeHandle = elementIndex(target));
      $$invalidate(33, focus = true);
    }
  }
  function sliderKeydown(event) {
    if (!disabled) {
      let prevent = false;
      const handle = elementIndex(event.target);
      let jump = step;
      if (event.ctrlKey || event.metaKey) {
        const onePercent = (max2 - min2) / 100;
        jump = Math.max(step, Math.round(onePercent / step) * step);
      } else if (event.shiftKey || event.key === "PageUp" || event.key === "PageDown") {
        const tenPercent = (max2 - min2) / 10;
        jump = Math.max(step, Math.round(tenPercent / step) * step);
      }
      switch (event.key) {
        case "PageUp":
        case "ArrowRight":
        case "ArrowUp":
          moveHandle(handle, values[handle] + jump);
          prevent = true;
          break;
        case "PageDown":
        case "ArrowLeft":
        case "ArrowDown":
          moveHandle(handle, values[handle] - jump);
          prevent = true;
          break;
        case "Home":
          moveHandle(handle, min2);
          prevent = true;
          break;
        case "End":
          moveHandle(handle, max2);
          prevent = true;
          break;
      }
      if (prevent) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }
  function sliderInteractStart(event) {
    if (!disabled) {
      const target = event.target;
      const clientPos = normalisedClient(event);
      $$invalidate(33, focus = true);
      if (target.matches(".rangeBar") && range === true && draggy) {
        handleActivated = false;
        $$invalidate(34, handlePressed = false);
        $$invalidate(36, activeHandle = -1);
        rangeActivated = true;
        $$invalidate(35, rangePressed = true);
        getRangeDistancesOnInteractionStart(clientPos);
      } else {
        handleActivated = true;
        $$invalidate(34, handlePressed = true);
        $$invalidate(36, activeHandle = getClosestHandle(clientPos));
        if (event.type === "touchstart" && !target.matches(".rsPipVal")) {
          handleInteract(clientPos);
        }
      }
      startValues = values.map((v) => constrainAndAlignValue(v, min2, max2, step, precision, limits));
      previousValues = [...startValues];
      eStart();
    }
  }
  function sliderInteractEnd(event) {
    if (event.type === "touchend") {
      eStop();
    }
    $$invalidate(34, handlePressed = false);
    $$invalidate(35, rangePressed = false);
  }
  function bodyInteractStart(event) {
    const target = event.target;
    keyboardActive = false;
    if (slider && focus && target !== slider && !slider.contains(target)) {
      $$invalidate(33, focus = false);
    }
  }
  function bodyInteract(event) {
    if (!disabled) {
      if (handleActivated) {
        handleInteract(normalisedClient(event));
      } else if (rangeActivated) {
        rangeInteract(normalisedClient(event));
      }
    }
  }
  function bodyMouseUp(event) {
    if (!disabled) {
      const target = event.target;
      if (handleActivated) {
        if (slider && (target === slider || slider.contains(target))) {
          $$invalidate(33, focus = true);
          if (!targetIsHandle(target) && !target.matches(".rsPipVal")) {
            handleInteract(normalisedClient(event));
          }
        }
      }
      if (handleActivated || rangeActivated) {
        eStop();
      }
    }
    handleActivated = false;
    $$invalidate(34, handlePressed = false);
    rangeActivated = false;
    $$invalidate(35, rangePressed = false);
  }
  function bodyTouchEnd(event) {
    handleActivated = false;
    $$invalidate(34, handlePressed = false);
    rangeActivated = false;
    $$invalidate(35, rangePressed = false);
  }
  function bodyKeyDown(event) {
    const target = event.target;
    if (!disabled && slider) {
      if (target === slider || slider.contains(target)) {
        keyboardActive = true;
      }
    }
  }
  function eStart() {
    if (disabled) return;
    dispatch("start", {
      activeHandle,
      value: startValues[activeHandle],
      values: startValues
    });
  }
  function eStop() {
    if (disabled) return;
    const startValue = rangeActivated ? startValues : startValues[activeHandle];
    dispatch("stop", {
      activeHandle,
      startValue,
      value: values[activeHandle],
      values: values.map((v) => constrainAndAlignValue(v, min2, max2, step, precision, limits))
    });
  }
  function eChange() {
    if (disabled) return;
    const startValue = rangeActivated ? startValues : startValues[activeHandle];
    const previousValue = typeof previousValues === "undefined" ? startValue : rangeActivated ? previousValues : previousValues[activeHandle];
    dispatch("change", {
      activeHandle,
      startValue,
      previousValue,
      value: values[activeHandle],
      values: values.map((v) => constrainAndAlignValue(v, min2, max2, step, precision, limits))
    });
  }
  function ariaLabelFormatter(value2, index) {
    const percent = valueAsPercent(value2, min2, max2, precision);
    const formattedValue = handleFormatter(value2, index, percent);
    const textLabel = pureText(String(formattedValue));
    return `${prefix}${textLabel}${suffix}`;
  }
  function div_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      slider = $$value;
      $$invalidate(0, slider);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("slider" in $$props2) $$invalidate(0, slider = $$props2.slider);
    if ("precision" in $$props2) $$invalidate(10, precision = $$props2.precision);
    if ("range" in $$props2) $$invalidate(11, range = $$props2.range);
    if ("pushy" in $$props2) $$invalidate(59, pushy = $$props2.pushy);
    if ("draggy" in $$props2) $$invalidate(12, draggy = $$props2.draggy);
    if ("min" in $$props2) $$invalidate(1, min2 = $$props2.min);
    if ("max" in $$props2) $$invalidate(2, max2 = $$props2.max);
    if ("step" in $$props2) $$invalidate(3, step = $$props2.step);
    if ("values" in $$props2) $$invalidate(4, values = $$props2.values);
    if ("value" in $$props2) $$invalidate(9, value = $$props2.value);
    if ("vertical" in $$props2) $$invalidate(13, vertical = $$props2.vertical);
    if ("float" in $$props2) $$invalidate(14, float = $$props2.float);
    if ("rangeFloat" in $$props2) $$invalidate(15, rangeFloat = $$props2.rangeFloat);
    if ("reversed" in $$props2) $$invalidate(16, reversed = $$props2.reversed);
    if ("hoverable" in $$props2) $$invalidate(17, hoverable = $$props2.hoverable);
    if ("disabled" in $$props2) $$invalidate(18, disabled = $$props2.disabled);
    if ("limits" in $$props2) $$invalidate(19, limits = $$props2.limits);
    if ("rangeGapMin" in $$props2) $$invalidate(57, rangeGapMin = $$props2.rangeGapMin);
    if ("rangeGapMax" in $$props2) $$invalidate(58, rangeGapMax = $$props2.rangeGapMax);
    if ("pips" in $$props2) $$invalidate(20, pips = $$props2.pips);
    if ("pipstep" in $$props2) $$invalidate(21, pipstep = $$props2.pipstep);
    if ("all" in $$props2) $$invalidate(22, all = $$props2.all);
    if ("first" in $$props2) $$invalidate(31, first = $$props2.first);
    if ("last" in $$props2) $$invalidate(23, last = $$props2.last);
    if ("rest" in $$props2) $$invalidate(24, rest = $$props2.rest);
    if ("prefix" in $$props2) $$invalidate(25, prefix = $$props2.prefix);
    if ("suffix" in $$props2) $$invalidate(26, suffix = $$props2.suffix);
    if ("formatter" in $$props2) $$invalidate(5, formatter = $$props2.formatter);
    if ("handleFormatter" in $$props2) $$invalidate(6, handleFormatter = $$props2.handleFormatter);
    if ("rangeFormatter" in $$props2) $$invalidate(7, rangeFormatter = $$props2.rangeFormatter);
    if ("ariaLabels" in $$props2) $$invalidate(8, ariaLabels = $$props2.ariaLabels);
    if ("id" in $$props2) $$invalidate(27, id = $$props2.id);
    if ("class" in $$props2) $$invalidate(28, classes = $$props2.class);
    if ("style" in $$props2) $$invalidate(29, style = $$props2.style);
    if ("darkmode" in $$props2) $$invalidate(30, darkmode = $$props2.darkmode);
    if ("springValues" in $$props2) $$invalidate(60, springValues = $$props2.springValues);
    if ("spring" in $$props2) $$invalidate(61, spring$1 = $$props2.spring);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*value*/
    512) {
      updateValues();
    }
    if ($$self.$$.dirty[0] & /*range, min, max, step, precision, limits, slider, values, value*/
    527903 | $$self.$$.dirty[2] & /*valueLength*/
    1) {
      ((uValues, uValue) => {
        const trimmedValues = trimRange(uValues, range);
        const trimmedAlignedValues = trimmedValues.map((v) => constrainAndAlignValue(v, min2, max2, step, precision, limits));
        if (!(uValues.length === trimmedAlignedValues.length) || !uValues.every((item, i) => coerceFloat(item, precision) === trimmedAlignedValues[i])) {
          uValues = trimmedAlignedValues;
        }
        if (valueLength !== uValues.length) {
          createSpring(uValues);
        } else if (slider) {
          updateSpring(uValues);
        }
        $$invalidate(4, values = uValues);
        $$invalidate(62, valueLength = uValues.length);
      })(values);
    }
    if ($$self.$$.dirty[0] & /*values*/
    16) {
      updateValue();
    }
    if ($$self.$$.dirty[0] & /*ariaLabels*/
    256) {
      checkAriaLabels();
    }
    if ($$self.$$.dirty[0] & /*min*/
    2) {
      checkMinMax();
    }
    if ($$self.$$.dirty[0] & /*max*/
    4) {
      checkMinMax();
    }
    if ($$self.$$.dirty[0] & /*step*/
    8) {
      checkStep();
    }
    if ($$self.$$.dirty[1] & /*rangeGapMin*/
    67108864) {
      checkValuesAgainstRangeGaps();
    }
    if ($$self.$$.dirty[1] & /*rangeGapMax*/
    134217728) {
      checkValuesAgainstRangeGaps();
    }
    if ($$self.$$.dirty[0] & /*formatter*/
    32) {
      checkFormatters();
    }
    if ($$self.$$.dirty[0] & /*handleFormatter*/
    64) {
      checkFormatters();
    }
    if ($$self.$$.dirty[0] & /*rangeFormatter*/
    128) {
      checkFormatters();
    }
    if ($$self.$$.dirty[1] & /*springValues*/
    536870912) {
      updateSpringValues();
    }
    if ($$self.$$.dirty[0] & /*range, values*/
    2064) {
      $$invalidate(41, hasRange = range === true && values.length === 2 || (range === "min" || range === "max") && values.length === 1);
    }
    if ($$self.$$.dirty[0] & /*vertical, reversed*/
    73728) {
      $$invalidate(40, orientationStart = vertical ? reversed ? "top" : "bottom" : reversed ? "right" : "left");
    }
    if ($$self.$$.dirty[0] & /*vertical, reversed*/
    73728) {
      $$invalidate(39, orientationEnd = vertical ? reversed ? "bottom" : "top" : reversed ? "left" : "right");
    }
  };
  return [
    slider,
    min2,
    max2,
    step,
    values,
    formatter,
    handleFormatter,
    rangeFormatter,
    ariaLabels,
    value,
    precision,
    range,
    draggy,
    vertical,
    float,
    rangeFloat,
    reversed,
    hoverable,
    disabled,
    limits,
    pips,
    pipstep,
    all,
    last,
    rest,
    prefix,
    suffix,
    id,
    classes,
    style,
    darkmode,
    first,
    isMounted,
    focus,
    handlePressed,
    rangePressed,
    activeHandle,
    sliderSize,
    springPositions,
    orientationEnd,
    orientationStart,
    hasRange,
    $springPositions,
    moveHandle,
    rangeStartPercent,
    rangeEndPercent,
    sliderBlurHandle,
    sliderFocusHandle,
    sliderKeydown,
    sliderInteractStart,
    sliderInteractEnd,
    bodyInteractStart,
    bodyInteract,
    bodyMouseUp,
    bodyTouchEnd,
    bodyKeyDown,
    ariaLabelFormatter,
    rangeGapMin,
    rangeGapMax,
    pushy,
    springValues,
    spring$1,
    valueLength,
    div_binding
  ];
}
class RangeSlider extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance,
      create_fragment,
      safe_not_equal,
      {
        slider: 0,
        precision: 10,
        range: 11,
        pushy: 59,
        draggy: 12,
        min: 1,
        max: 2,
        step: 3,
        values: 4,
        value: 9,
        vertical: 13,
        float: 14,
        rangeFloat: 15,
        reversed: 16,
        hoverable: 17,
        disabled: 18,
        limits: 19,
        rangeGapMin: 57,
        rangeGapMax: 58,
        pips: 20,
        pipstep: 21,
        all: 22,
        first: 31,
        last: 23,
        rest: 24,
        prefix: 25,
        suffix: 26,
        formatter: 5,
        handleFormatter: 6,
        rangeFormatter: 7,
        ariaLabels: 8,
        id: 27,
        class: 28,
        style: 29,
        darkmode: 30,
        springValues: 60,
        spring: 61
      },
      add_css,
      [-1, -1, -1, -1]
    );
  }
  get slider() {
    return this.$$.ctx[0];
  }
  set slider(slider) {
    this.$$set({ slider });
    flush();
  }
  get precision() {
    return this.$$.ctx[10];
  }
  set precision(precision) {
    this.$$set({ precision });
    flush();
  }
  get range() {
    return this.$$.ctx[11];
  }
  set range(range) {
    this.$$set({ range });
    flush();
  }
  get pushy() {
    return this.$$.ctx[59];
  }
  set pushy(pushy) {
    this.$$set({ pushy });
    flush();
  }
  get draggy() {
    return this.$$.ctx[12];
  }
  set draggy(draggy) {
    this.$$set({ draggy });
    flush();
  }
  get min() {
    return this.$$.ctx[1];
  }
  set min(min2) {
    this.$$set({ min: min2 });
    flush();
  }
  get max() {
    return this.$$.ctx[2];
  }
  set max(max2) {
    this.$$set({ max: max2 });
    flush();
  }
  get step() {
    return this.$$.ctx[3];
  }
  set step(step) {
    this.$$set({ step });
    flush();
  }
  get values() {
    return this.$$.ctx[4];
  }
  set values(values) {
    this.$$set({ values });
    flush();
  }
  get value() {
    return this.$$.ctx[9];
  }
  set value(value) {
    this.$$set({ value });
    flush();
  }
  get vertical() {
    return this.$$.ctx[13];
  }
  set vertical(vertical) {
    this.$$set({ vertical });
    flush();
  }
  get float() {
    return this.$$.ctx[14];
  }
  set float(float) {
    this.$$set({ float });
    flush();
  }
  get rangeFloat() {
    return this.$$.ctx[15];
  }
  set rangeFloat(rangeFloat) {
    this.$$set({ rangeFloat });
    flush();
  }
  get reversed() {
    return this.$$.ctx[16];
  }
  set reversed(reversed) {
    this.$$set({ reversed });
    flush();
  }
  get hoverable() {
    return this.$$.ctx[17];
  }
  set hoverable(hoverable) {
    this.$$set({ hoverable });
    flush();
  }
  get disabled() {
    return this.$$.ctx[18];
  }
  set disabled(disabled) {
    this.$$set({ disabled });
    flush();
  }
  get limits() {
    return this.$$.ctx[19];
  }
  set limits(limits) {
    this.$$set({ limits });
    flush();
  }
  get rangeGapMin() {
    return this.$$.ctx[57];
  }
  set rangeGapMin(rangeGapMin) {
    this.$$set({ rangeGapMin });
    flush();
  }
  get rangeGapMax() {
    return this.$$.ctx[58];
  }
  set rangeGapMax(rangeGapMax) {
    this.$$set({ rangeGapMax });
    flush();
  }
  get pips() {
    return this.$$.ctx[20];
  }
  set pips(pips) {
    this.$$set({ pips });
    flush();
  }
  get pipstep() {
    return this.$$.ctx[21];
  }
  set pipstep(pipstep) {
    this.$$set({ pipstep });
    flush();
  }
  get all() {
    return this.$$.ctx[22];
  }
  set all(all) {
    this.$$set({ all });
    flush();
  }
  get first() {
    return this.$$.ctx[31];
  }
  set first(first) {
    this.$$set({ first });
    flush();
  }
  get last() {
    return this.$$.ctx[23];
  }
  set last(last) {
    this.$$set({ last });
    flush();
  }
  get rest() {
    return this.$$.ctx[24];
  }
  set rest(rest) {
    this.$$set({ rest });
    flush();
  }
  get prefix() {
    return this.$$.ctx[25];
  }
  set prefix(prefix) {
    this.$$set({ prefix });
    flush();
  }
  get suffix() {
    return this.$$.ctx[26];
  }
  set suffix(suffix) {
    this.$$set({ suffix });
    flush();
  }
  get formatter() {
    return this.$$.ctx[5];
  }
  set formatter(formatter) {
    this.$$set({ formatter });
    flush();
  }
  get handleFormatter() {
    return this.$$.ctx[6];
  }
  set handleFormatter(handleFormatter) {
    this.$$set({ handleFormatter });
    flush();
  }
  get rangeFormatter() {
    return this.$$.ctx[7];
  }
  set rangeFormatter(rangeFormatter) {
    this.$$set({ rangeFormatter });
    flush();
  }
  get ariaLabels() {
    return this.$$.ctx[8];
  }
  set ariaLabels(ariaLabels) {
    this.$$set({ ariaLabels });
    flush();
  }
  get id() {
    return this.$$.ctx[27];
  }
  set id(id) {
    this.$$set({ id });
    flush();
  }
  get class() {
    return this.$$.ctx[28];
  }
  set class(classes) {
    this.$$set({ class: classes });
    flush();
  }
  get style() {
    return this.$$.ctx[29];
  }
  set style(style) {
    this.$$set({ style });
    flush();
  }
  get darkmode() {
    return this.$$.ctx[30];
  }
  set darkmode(darkmode) {
    this.$$set({ darkmode });
    flush();
  }
  get springValues() {
    return this.$$.ctx[60];
  }
  set springValues(springValues) {
    this.$$set({ springValues });
    flush();
  }
  get spring() {
    return this.$$.ctx[61];
  }
  set spring(spring2) {
    this.$$set({ spring: spring2 });
    flush();
  }
}
create_custom_element(RangeSlider, { "slider": {}, "precision": {}, "range": { "type": "Boolean" }, "pushy": { "type": "Boolean" }, "draggy": { "type": "Boolean" }, "min": {}, "max": {}, "step": {}, "values": {}, "value": {}, "vertical": { "type": "Boolean" }, "float": { "type": "Boolean" }, "rangeFloat": { "type": "Boolean" }, "reversed": { "type": "Boolean" }, "hoverable": { "type": "Boolean" }, "disabled": { "type": "Boolean" }, "limits": {}, "rangeGapMin": {}, "rangeGapMax": {}, "pips": { "type": "Boolean" }, "pipstep": {}, "all": { "type": "Boolean" }, "first": {}, "last": {}, "rest": {}, "prefix": {}, "suffix": {}, "formatter": {}, "handleFormatter": {}, "rangeFormatter": {}, "ariaLabels": {}, "id": {}, "class": {}, "style": {}, "darkmode": { "type": "Boolean" }, "springValues": {}, "spring": { "type": "Boolean" } }, [], [], true);
const DIFF2NUM = { basic: 1, easy: 2, medium: 3, hard: 4, master: 5 };
const WORD2NUM = { one: 1, two: 2, three: 3, four: 4, five: 5 };
const ICONS = {
  1: { label: "basic", img: "./assets/img/usefulness/signal-one.svg" },
  2: { label: "easy", img: "./assets/img/usefulness/signal-two.svg" },
  3: { label: "medium", img: "./assets/img/usefulness/signal-three.svg" },
  4: { label: "hard", img: "./assets/img/usefulness/signal-four.svg" },
  5: { label: "master", img: "./assets/img/usefulness/signal-five.svg" }
};
const safe = (s) => String(s).replace(/"/g, "").trim();
const inRange = (v, [min2, max2]) => typeof v === "number" && v >= min2 && v <= max2;
function normalize15(v) {
  if (v == null) return null;
  if (typeof v === "number") return v >= 1 && v <= 5 ? v : null;
  const s = String(v).trim().toLowerCase();
  if (/^[1-5]$/.test(s)) return Number(s);
  const last = s.split(/[^a-z0-9]+/).pop();
  return WORD2NUM[last] ?? null;
}
function parseUsefulnessFromLink(linkEl) {
  const el = linkEl.querySelector("[data-usefulness]");
  if (!el) return null;
  return normalize15(el.getAttribute("data-usefulness"));
}
function parseDifficultyFromLink(linkEl) {
  const el = linkEl.querySelector("[data-difficulty]");
  if (!el) return null;
  const raw = (el.getAttribute("data-difficulty") || "").toLowerCase().trim();
  return DIFF2NUM[raw] ?? normalize15(raw);
}
function getSummary(details) {
  return details?.querySelector("summary") || null;
}
function getBody(details) {
  const s = getSummary(details);
  return s ? s.nextElementSibling : null;
}
function isSliding(details) {
  const b = getBody(details);
  return !!(b && b.classList.contains("--slide"));
}
function syncDetails(details, open) {
  const s = getSummary(details);
  const b = getBody(details);
  if (!s || !b) return;
  details.open = !!open;
  s.classList.toggle("--spoller-active", !!open);
  b.hidden = !open;
}
function expandAllMode() {
  const btn = document.querySelector(".catalog__close-tabs");
  return !!(btn && btn.classList.contains("--active"));
}
function forceOpenAllSpollers() {
  document.querySelectorAll(".catalog__spollers [data-fls-spollers].--spoller-init details").forEach((d) => syncDetails(d, true));
  const btn = document.querySelector(".catalog__close-tabs");
  if (btn) {
    btn.classList.add("--active");
    btn.textContent = "Collapse all";
  }
}
function applyFilterStrict(uRange, dRange) {
  const links = document.querySelectorAll(".spoller-block__link");
  links.forEach((link) => {
    const u = parseUsefulnessFromLink(link);
    const d = parseDifficultyFromLink(link);
    const passU = inRange(u, uRange);
    const passD = inRange(d, dRange);
    const show = passU && passD;
    link.classList.toggle("is-hidden", !show);
  });
  document.querySelectorAll(".spoller-block__link-item").forEach((item) => {
    const anyVisible = item.querySelector(".spoller-block__link:not(.is-hidden)");
    const empty2 = !anyVisible;
    item.classList.toggle("is-empty", empty2);
    item.style.display = empty2 ? "none" : "";
  });
  const keepAllOpen = expandAllMode();
  document.querySelectorAll(".spoller-block__item").forEach((block) => {
    const details = block.querySelector("details");
    if (!details) return;
    const anyVisibleItem = block.querySelector(".spoller-block__link-item:not(.is-empty)");
    const empty2 = !anyVisibleItem;
    block.classList.toggle("is-empty", empty2);
    if (isSliding(details)) return;
    if (empty2) {
      details.dataset.wasOpen = details.open ? "1" : "0";
      details.dataset.closedByFilter = "1";
      syncDetails(details, false);
    } else {
      if (details.dataset.closedByFilter === "1") {
        const shouldOpen = keepAllOpen || details.dataset.wasOpen === "1";
        syncDetails(details, shouldOpen);
        delete details.dataset.closedByFilter;
        delete details.dataset.wasOpen;
      } else if (keepAllOpen) {
        syncDetails(details, true);
      }
    }
  });
  document.querySelectorAll(".catalog__spoller-block").forEach((group) => {
    const anyNonEmptyItem = group.querySelector(".spoller-block__item:not(.is-empty)");
    group.classList.toggle("is-empty", !anyNonEmptyItem);
  });
}
function initSliders(onChange) {
  const targetIcons = document.querySelector("#range-slider-icons");
  const targetLabels = document.querySelector("#range-slider-labels");
  if (!targetIcons || !targetLabels) {
    console.warn("[filters] range targets not found");
    return { sliderIcons: null, sliderLabels: null };
  }
  const iconPipFormatter = (v) => {
    const it = ICONS[v];
    return it ? `<div class="pipIcon"><img src="${safe(it.img)}" alt="${it.label}"></div>` : String(v);
  };
  const iconHandleFormatter = (v) => {
    const it = ICONS[v];
    return it ? `<img src="${safe(it.img)}" alt="${it.label}">` : String(v);
  };
  const sliderIcons = new RangeSlider({
    target: targetIcons,
    props: {
      min: 1,
      max: 5,
      step: 1,
      values: [1, 5],
      range: true,
      pips: true,
      pipstep: 1,
      all: "label",
      formatter: iconPipFormatter,
      handleFormatter: iconHandleFormatter,
      hoverable: true
    }
  });
  const DIFF = { 1: "basic", 2: "easy", 3: "medium", 4: "hard", 5: "master" };
  const labelPipFormatter = (v) => {
    const cls = DIFF[v];
    return cls ? `<div class="${cls}">${cls}</div>` : String(v);
  };
  const sliderLabels = new RangeSlider({
    target: targetLabels,
    props: {
      min: 1,
      max: 5,
      step: 1,
      values: [1, 5],
      range: true,
      pips: true,
      pipstep: 1,
      all: "label",
      formatter: labelPipFormatter,
      handleFormatter: (v) => String(v),
      hoverable: true
    }
  });
  const getVals = (e) => {
    const detail = e?.detail;
    if (!detail) return [1, 5];
    if (Array.isArray(detail.values)) return detail.values;
    if (Array.isArray(detail)) return detail;
    if (typeof detail.value === "number") return [detail.value, detail.value];
    return [1, 5];
  };
  sliderIcons.$on("input", (e) => onChange("u", getVals(e)));
  sliderIcons.$on("change", (e) => onChange("u", getVals(e)));
  sliderLabels.$on("input", (e) => onChange("d", getVals(e)));
  sliderLabels.$on("change", (e) => onChange("d", getVals(e)));
  return { sliderIcons, sliderLabels };
}
function initCatalogToggle() {
  const btn = document.querySelector(".catalog__close-tabs");
  if (!btn) return;
  const scope = document.querySelector(".catalog__spollers") || document;
  const computeNext = () => !!scope.querySelector("[data-fls-spollers].--spoller-init details:not([open])");
  let nextIsExpand = computeNext();
  const setBtnState = () => {
    btn.textContent = nextIsExpand ? "Expand all" : "Collapse all";
    btn.classList.toggle("--active", !nextIsExpand);
  };
  const toggleAll = () => {
    const blocks = scope.querySelectorAll("[data-fls-spollers].--spoller-init");
    blocks.forEach((spollersBlock) => {
      const speed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
      spollersBlock.querySelectorAll("details").forEach((detailsEl) => {
        const summary = detailsEl.querySelector("summary");
        const body = summary?.nextElementSibling;
        if (!summary || !body) return;
        if (body.classList.contains("--slide")) return;
        if (nextIsExpand) {
          detailsEl.open = true;
          summary.classList.add("--spoller-active");
          if (body.hidden) body.hidden = false;
        } else {
          summary.classList.remove("--spoller-active");
          body.hidden = true;
          setTimeout(() => {
            detailsEl.open = false;
          }, speed);
        }
      });
    });
  };
  setBtnState();
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleAll();
    nextIsExpand = !nextIsExpand;
    setBtnState();
  });
}
(function bootstrap() {
  let uRange = [1, 5];
  let dRange = [1, 5];
  document.addEventListener("DOMContentLoaded", () => {
    initSliders((which, vals) => {
      const [a, b] = vals.slice(0, 2).sort((x, y) => x - y);
      if (which === "u") uRange = [a, b];
      else dRange = [a, b];
      applyFilterStrict(uRange, dRange);
    });
    applyFilterStrict(uRange, dRange);
    initCatalogToggle();
  });
  document.addEventListener("fls:spollers-inited", () => {
    requestAnimationFrame(() => forceOpenAllSpollers());
    requestAnimationFrame(() => applyFilterStrict(uRange, dRange));
  });
  window.addEventListener("load", () => {
    const anyClosed = document.querySelector(".catalog__spollers [data-fls-spollers].--spoller-init details:not([open])");
    if (anyClosed) requestAnimationFrame(() => forceOpenAllSpollers());
    requestAnimationFrame(() => applyFilterStrict(uRange, dRange));
  });
  const root = document.querySelector(".catalog__spollers");
  if (root) {
    let rafId = null;
    const reapply = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        applyFilterStrict(uRange, dRange);
        if (expandAllMode()) forceOpenAllSpollers();
      });
    };
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.addedNodes?.length || m.removedNodes?.length || m.type === "attributes") {
          reapply();
          break;
        }
      }
    });
    mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-usefulness", "data-difficulty", "open", "class"] });
  }
})();
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}
/*!
 * GSAP 3.13.0
 * https://gsap.com
 *
 * @license Copyright 2008-2025, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/
var _config = {
  autoSleep: 120,
  force3D: "auto",
  nullTargetWarn: 1,
  units: {
    lineHeight: ""
  }
}, _defaults$1 = {
  duration: 0.5,
  overwrite: false,
  delay: 0
}, _suppressOverwrites, _reverting$1, _context, _bigNum$1 = 1e8, _tinyNum = 1 / _bigNum$1, _2PI = Math.PI * 2, _HALF_PI = _2PI / 4, _gsID = 0, _sqrt = Math.sqrt, _cos = Math.cos, _sin = Math.sin, _isString = function _isString2(value) {
  return typeof value === "string";
}, _isFunction = function _isFunction2(value) {
  return typeof value === "function";
}, _isNumber = function _isNumber2(value) {
  return typeof value === "number";
}, _isUndefined = function _isUndefined2(value) {
  return typeof value === "undefined";
}, _isObject = function _isObject2(value) {
  return typeof value === "object";
}, _isNotFalse = function _isNotFalse2(value) {
  return value !== false;
}, _windowExists$1 = function _windowExists2() {
  return typeof window !== "undefined";
}, _isFuncOrString = function _isFuncOrString2(value) {
  return _isFunction(value) || _isString(value);
}, _isTypedArray = typeof ArrayBuffer === "function" && ArrayBuffer.isView || function() {
}, _isArray = Array.isArray, _strictNumExp = /(?:-?\.?\d|\.)+/gi, _numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, _numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, _complexStringNumExp = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, _relExp = /[+-]=-?[.\d]+/, _delimitedValueExp = /[^,'"\[\]\s]+/gi, _unitExp = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, _globalTimeline, _win$1, _coreInitted, _doc$1, _globals = {}, _installScope = {}, _coreReady, _install = function _install2(scope) {
  return (_installScope = _merge(scope, _globals)) && gsap;
}, _missingPlugin = function _missingPlugin2(property, value) {
  return console.warn("Invalid property", property, "set to", value, "Missing plugin? gsap.registerPlugin()");
}, _warn = function _warn2(message, suppress) {
  return !suppress && console.warn(message);
}, _addGlobal = function _addGlobal2(name, obj) {
  return name && (_globals[name] = obj) && _installScope && (_installScope[name] = obj) || _globals;
}, _emptyFunc = function _emptyFunc2() {
  return 0;
}, _startAtRevertConfig = {
  suppressEvents: true,
  isStart: true,
  kill: false
}, _revertConfigNoKill = {
  suppressEvents: true,
  kill: false
}, _revertConfig = {
  suppressEvents: true
}, _reservedProps = {}, _lazyTweens = [], _lazyLookup = {}, _lastRenderedFrame, _plugins = {}, _effects = {}, _nextGCFrame = 30, _harnessPlugins = [], _callbackNames = "", _harness = function _harness2(targets) {
  var target = targets[0], harnessPlugin, i;
  _isObject(target) || _isFunction(target) || (targets = [targets]);
  if (!(harnessPlugin = (target._gsap || {}).harness)) {
    i = _harnessPlugins.length;
    while (i-- && !_harnessPlugins[i].targetTest(target)) {
    }
    harnessPlugin = _harnessPlugins[i];
  }
  i = targets.length;
  while (i--) {
    targets[i] && (targets[i]._gsap || (targets[i]._gsap = new GSCache(targets[i], harnessPlugin))) || targets.splice(i, 1);
  }
  return targets;
}, _getCache = function _getCache2(target) {
  return target._gsap || _harness(toArray$1(target))[0]._gsap;
}, _getProperty = function _getProperty2(target, property, v) {
  return (v = target[property]) && _isFunction(v) ? target[property]() : _isUndefined(v) && target.getAttribute && target.getAttribute(property) || v;
}, _forEachName = function _forEachName2(names, func) {
  return (names = names.split(",")).forEach(func) || names;
}, _round = function _round2(value) {
  return Math.round(value * 1e5) / 1e5 || 0;
}, _roundPrecise = function _roundPrecise2(value) {
  return Math.round(value * 1e7) / 1e7 || 0;
}, _parseRelative = function _parseRelative2(start2, value) {
  var operator = value.charAt(0), end2 = parseFloat(value.substr(2));
  start2 = parseFloat(start2);
  return operator === "+" ? start2 + end2 : operator === "-" ? start2 - end2 : operator === "*" ? start2 * end2 : start2 / end2;
}, _arrayContainsAny = function _arrayContainsAny2(toSearch, toFind) {
  var l = toFind.length, i = 0;
  for (; toSearch.indexOf(toFind[i]) < 0 && ++i < l; ) {
  }
  return i < l;
}, _lazyRender = function _lazyRender2() {
  var l = _lazyTweens.length, a = _lazyTweens.slice(0), i, tween;
  _lazyLookup = {};
  _lazyTweens.length = 0;
  for (i = 0; i < l; i++) {
    tween = a[i];
    tween && tween._lazy && (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
  }
}, _isRevertWorthy = function _isRevertWorthy2(animation) {
  return !!(animation._initted || animation._startAt || animation.add);
}, _lazySafeRender = function _lazySafeRender2(animation, time, suppressEvents, force) {
  _lazyTweens.length && !_reverting$1 && _lazyRender();
  animation.render(time, suppressEvents, !!(_reverting$1 && time < 0 && _isRevertWorthy(animation)));
  _lazyTweens.length && !_reverting$1 && _lazyRender();
}, _numericIfPossible = function _numericIfPossible2(value) {
  var n = parseFloat(value);
  return (n || n === 0) && (value + "").match(_delimitedValueExp).length < 2 ? n : _isString(value) ? value.trim() : value;
}, _passThrough = function _passThrough2(p) {
  return p;
}, _setDefaults = function _setDefaults2(obj, defaults22) {
  for (var p in defaults22) {
    p in obj || (obj[p] = defaults22[p]);
  }
  return obj;
}, _setKeyframeDefaults = function _setKeyframeDefaults2(excludeDuration) {
  return function(obj, defaults22) {
    for (var p in defaults22) {
      p in obj || p === "duration" && excludeDuration || p === "ease" || (obj[p] = defaults22[p]);
    }
  };
}, _merge = function _merge2(base, toMerge) {
  for (var p in toMerge) {
    base[p] = toMerge[p];
  }
  return base;
}, _mergeDeep = function _mergeDeep2(base, toMerge) {
  for (var p in toMerge) {
    p !== "__proto__" && p !== "constructor" && p !== "prototype" && (base[p] = _isObject(toMerge[p]) ? _mergeDeep2(base[p] || (base[p] = {}), toMerge[p]) : toMerge[p]);
  }
  return base;
}, _copyExcluding = function _copyExcluding2(obj, excluding) {
  var copy = {}, p;
  for (p in obj) {
    p in excluding || (copy[p] = obj[p]);
  }
  return copy;
}, _inheritDefaults = function _inheritDefaults2(vars) {
  var parent = vars.parent || _globalTimeline, func = vars.keyframes ? _setKeyframeDefaults(_isArray(vars.keyframes)) : _setDefaults;
  if (_isNotFalse(vars.inherit)) {
    while (parent) {
      func(vars, parent.vars.defaults);
      parent = parent.parent || parent._dp;
    }
  }
  return vars;
}, _arraysMatch = function _arraysMatch2(a1, a2) {
  var i = a1.length, match = i === a2.length;
  while (match && i-- && a1[i] === a2[i]) {
  }
  return i < 0;
}, _addLinkedListItem = function _addLinkedListItem2(parent, child, firstProp, lastProp, sortBy) {
  var prev = parent[lastProp], t;
  if (sortBy) {
    t = child[sortBy];
    while (prev && prev[sortBy] > t) {
      prev = prev._prev;
    }
  }
  if (prev) {
    child._next = prev._next;
    prev._next = child;
  } else {
    child._next = parent[firstProp];
    parent[firstProp] = child;
  }
  if (child._next) {
    child._next._prev = child;
  } else {
    parent[lastProp] = child;
  }
  child._prev = prev;
  child.parent = child._dp = parent;
  return child;
}, _removeLinkedListItem = function _removeLinkedListItem2(parent, child, firstProp, lastProp) {
  if (firstProp === void 0) {
    firstProp = "_first";
  }
  if (lastProp === void 0) {
    lastProp = "_last";
  }
  var prev = child._prev, next = child._next;
  if (prev) {
    prev._next = next;
  } else if (parent[firstProp] === child) {
    parent[firstProp] = next;
  }
  if (next) {
    next._prev = prev;
  } else if (parent[lastProp] === child) {
    parent[lastProp] = prev;
  }
  child._next = child._prev = child.parent = null;
}, _removeFromParent = function _removeFromParent2(child, onlyIfParentHasAutoRemove) {
  child.parent && (!onlyIfParentHasAutoRemove || child.parent.autoRemoveChildren) && child.parent.remove && child.parent.remove(child);
  child._act = 0;
}, _uncache = function _uncache2(animation, child) {
  if (animation && (!child || child._end > animation._dur || child._start < 0)) {
    var a = animation;
    while (a) {
      a._dirty = 1;
      a = a.parent;
    }
  }
  return animation;
}, _recacheAncestors = function _recacheAncestors2(animation) {
  var parent = animation.parent;
  while (parent && parent.parent) {
    parent._dirty = 1;
    parent.totalDuration();
    parent = parent.parent;
  }
  return animation;
}, _rewindStartAt = function _rewindStartAt2(tween, totalTime, suppressEvents, force) {
  return tween._startAt && (_reverting$1 ? tween._startAt.revert(_revertConfigNoKill) : tween.vars.immediateRender && !tween.vars.autoRevert || tween._startAt.render(totalTime, true, force));
}, _hasNoPausedAncestors = function _hasNoPausedAncestors2(animation) {
  return !animation || animation._ts && _hasNoPausedAncestors2(animation.parent);
}, _elapsedCycleDuration = function _elapsedCycleDuration2(animation) {
  return animation._repeat ? _animationCycle(animation._tTime, animation = animation.duration() + animation._rDelay) * animation : 0;
}, _animationCycle = function _animationCycle2(tTime, cycleDuration) {
  var whole = Math.floor(tTime = _roundPrecise(tTime / cycleDuration));
  return tTime && whole === tTime ? whole - 1 : whole;
}, _parentToChildTotalTime = function _parentToChildTotalTime2(parentTime, child) {
  return (parentTime - child._start) * child._ts + (child._ts >= 0 ? 0 : child._dirty ? child.totalDuration() : child._tDur);
}, _setEnd = function _setEnd2(animation) {
  return animation._end = _roundPrecise(animation._start + (animation._tDur / Math.abs(animation._ts || animation._rts || _tinyNum) || 0));
}, _alignPlayhead = function _alignPlayhead2(animation, totalTime) {
  var parent = animation._dp;
  if (parent && parent.smoothChildTiming && animation._ts) {
    animation._start = _roundPrecise(parent._time - (animation._ts > 0 ? totalTime / animation._ts : ((animation._dirty ? animation.totalDuration() : animation._tDur) - totalTime) / -animation._ts));
    _setEnd(animation);
    parent._dirty || _uncache(parent, animation);
  }
  return animation;
}, _postAddChecks = function _postAddChecks2(timeline2, child) {
  var t;
  if (child._time || !child._dur && child._initted || child._start < timeline2._time && (child._dur || !child.add)) {
    t = _parentToChildTotalTime(timeline2.rawTime(), child);
    if (!child._dur || _clamp(0, child.totalDuration(), t) - child._tTime > _tinyNum) {
      child.render(t, true);
    }
  }
  if (_uncache(timeline2, child)._dp && timeline2._initted && timeline2._time >= timeline2._dur && timeline2._ts) {
    if (timeline2._dur < timeline2.duration()) {
      t = timeline2;
      while (t._dp) {
        t.rawTime() >= 0 && t.totalTime(t._tTime);
        t = t._dp;
      }
    }
    timeline2._zTime = -_tinyNum;
  }
}, _addToTimeline = function _addToTimeline2(timeline2, child, position, skipChecks) {
  child.parent && _removeFromParent(child);
  child._start = _roundPrecise((_isNumber(position) ? position : position || timeline2 !== _globalTimeline ? _parsePosition(timeline2, position, child) : timeline2._time) + child._delay);
  child._end = _roundPrecise(child._start + (child.totalDuration() / Math.abs(child.timeScale()) || 0));
  _addLinkedListItem(timeline2, child, "_first", "_last", timeline2._sort ? "_start" : 0);
  _isFromOrFromStart(child) || (timeline2._recent = child);
  skipChecks || _postAddChecks(timeline2, child);
  timeline2._ts < 0 && _alignPlayhead(timeline2, timeline2._tTime);
  return timeline2;
}, _scrollTrigger = function _scrollTrigger2(animation, trigger) {
  return (_globals.ScrollTrigger || _missingPlugin("scrollTrigger", trigger)) && _globals.ScrollTrigger.create(trigger, animation);
}, _attemptInitTween = function _attemptInitTween2(tween, time, force, suppressEvents, tTime) {
  _initTween(tween, time, tTime);
  if (!tween._initted) {
    return 1;
  }
  if (!force && tween._pt && !_reverting$1 && (tween._dur && tween.vars.lazy !== false || !tween._dur && tween.vars.lazy) && _lastRenderedFrame !== _ticker.frame) {
    _lazyTweens.push(tween);
    tween._lazy = [tTime, suppressEvents];
    return 1;
  }
}, _parentPlayheadIsBeforeStart = function _parentPlayheadIsBeforeStart2(_ref) {
  var parent = _ref.parent;
  return parent && parent._ts && parent._initted && !parent._lock && (parent.rawTime() < 0 || _parentPlayheadIsBeforeStart2(parent));
}, _isFromOrFromStart = function _isFromOrFromStart2(_ref2) {
  var data = _ref2.data;
  return data === "isFromStart" || data === "isStart";
}, _renderZeroDurationTween = function _renderZeroDurationTween2(tween, totalTime, suppressEvents, force) {
  var prevRatio = tween.ratio, ratio = totalTime < 0 || !totalTime && (!tween._start && _parentPlayheadIsBeforeStart(tween) && !(!tween._initted && _isFromOrFromStart(tween)) || (tween._ts < 0 || tween._dp._ts < 0) && !_isFromOrFromStart(tween)) ? 0 : 1, repeatDelay = tween._rDelay, tTime = 0, pt, iteration, prevIteration;
  if (repeatDelay && tween._repeat) {
    tTime = _clamp(0, tween._tDur, totalTime);
    iteration = _animationCycle(tTime, repeatDelay);
    tween._yoyo && iteration & 1 && (ratio = 1 - ratio);
    if (iteration !== _animationCycle(tween._tTime, repeatDelay)) {
      prevRatio = 1 - ratio;
      tween.vars.repeatRefresh && tween._initted && tween.invalidate();
    }
  }
  if (ratio !== prevRatio || _reverting$1 || force || tween._zTime === _tinyNum || !totalTime && tween._zTime) {
    if (!tween._initted && _attemptInitTween(tween, totalTime, force, suppressEvents, tTime)) {
      return;
    }
    prevIteration = tween._zTime;
    tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0);
    suppressEvents || (suppressEvents = totalTime && !prevIteration);
    tween.ratio = ratio;
    tween._from && (ratio = 1 - ratio);
    tween._time = 0;
    tween._tTime = tTime;
    pt = tween._pt;
    while (pt) {
      pt.r(ratio, pt.d);
      pt = pt._next;
    }
    totalTime < 0 && _rewindStartAt(tween, totalTime, suppressEvents, true);
    tween._onUpdate && !suppressEvents && _callback(tween, "onUpdate");
    tTime && tween._repeat && !suppressEvents && tween.parent && _callback(tween, "onRepeat");
    if ((totalTime >= tween._tDur || totalTime < 0) && tween.ratio === ratio) {
      ratio && _removeFromParent(tween, 1);
      if (!suppressEvents && !_reverting$1) {
        _callback(tween, ratio ? "onComplete" : "onReverseComplete", true);
        tween._prom && tween._prom();
      }
    }
  } else if (!tween._zTime) {
    tween._zTime = totalTime;
  }
}, _findNextPauseTween = function _findNextPauseTween2(animation, prevTime, time) {
  var child;
  if (time > prevTime) {
    child = animation._first;
    while (child && child._start <= time) {
      if (child.data === "isPause" && child._start > prevTime) {
        return child;
      }
      child = child._next;
    }
  } else {
    child = animation._last;
    while (child && child._start >= time) {
      if (child.data === "isPause" && child._start < prevTime) {
        return child;
      }
      child = child._prev;
    }
  }
}, _setDuration = function _setDuration2(animation, duration, skipUncache, leavePlayhead) {
  var repeat = animation._repeat, dur = _roundPrecise(duration) || 0, totalProgress = animation._tTime / animation._tDur;
  totalProgress && !leavePlayhead && (animation._time *= dur / animation._dur);
  animation._dur = dur;
  animation._tDur = !repeat ? dur : repeat < 0 ? 1e10 : _roundPrecise(dur * (repeat + 1) + animation._rDelay * repeat);
  totalProgress > 0 && !leavePlayhead && _alignPlayhead(animation, animation._tTime = animation._tDur * totalProgress);
  animation.parent && _setEnd(animation);
  skipUncache || _uncache(animation.parent, animation);
  return animation;
}, _onUpdateTotalDuration = function _onUpdateTotalDuration2(animation) {
  return animation instanceof Timeline ? _uncache(animation) : _setDuration(animation, animation._dur);
}, _zeroPosition = {
  _start: 0,
  endTime: _emptyFunc,
  totalDuration: _emptyFunc
}, _parsePosition = function _parsePosition2(animation, position, percentAnimation) {
  var labels = animation.labels, recent = animation._recent || _zeroPosition, clippedDuration = animation.duration() >= _bigNum$1 ? recent.endTime(false) : animation._dur, i, offset2, isPercent;
  if (_isString(position) && (isNaN(position) || position in labels)) {
    offset2 = position.charAt(0);
    isPercent = position.substr(-1) === "%";
    i = position.indexOf("=");
    if (offset2 === "<" || offset2 === ">") {
      i >= 0 && (position = position.replace(/=/, ""));
      return (offset2 === "<" ? recent._start : recent.endTime(recent._repeat >= 0)) + (parseFloat(position.substr(1)) || 0) * (isPercent ? (i < 0 ? recent : percentAnimation).totalDuration() / 100 : 1);
    }
    if (i < 0) {
      position in labels || (labels[position] = clippedDuration);
      return labels[position];
    }
    offset2 = parseFloat(position.charAt(i - 1) + position.substr(i + 1));
    if (isPercent && percentAnimation) {
      offset2 = offset2 / 100 * (_isArray(percentAnimation) ? percentAnimation[0] : percentAnimation).totalDuration();
    }
    return i > 1 ? _parsePosition2(animation, position.substr(0, i - 1), percentAnimation) + offset2 : clippedDuration + offset2;
  }
  return position == null ? clippedDuration : +position;
}, _createTweenType = function _createTweenType2(type, params, timeline2) {
  var isLegacy = _isNumber(params[1]), varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1), vars = params[varsIndex], irVars, parent;
  isLegacy && (vars.duration = params[1]);
  vars.parent = timeline2;
  if (type) {
    irVars = vars;
    parent = timeline2;
    while (parent && !("immediateRender" in irVars)) {
      irVars = parent.vars.defaults || {};
      parent = _isNotFalse(parent.vars.inherit) && parent.parent;
    }
    vars.immediateRender = _isNotFalse(irVars.immediateRender);
    type < 2 ? vars.runBackwards = 1 : vars.startAt = params[varsIndex - 1];
  }
  return new Tween(params[0], vars, params[varsIndex + 1]);
}, _conditionalReturn = function _conditionalReturn2(value, func) {
  return value || value === 0 ? func(value) : func;
}, _clamp = function _clamp2(min2, max2, value) {
  return value < min2 ? min2 : value > max2 ? max2 : value;
}, getUnit = function getUnit2(value, v) {
  return !_isString(value) || !(v = _unitExp.exec(value)) ? "" : v[1];
}, clamp = function clamp2(min2, max2, value) {
  return _conditionalReturn(value, function(v) {
    return _clamp(min2, max2, v);
  });
}, _slice = [].slice, _isArrayLike = function _isArrayLike2(value, nonEmpty) {
  return value && _isObject(value) && "length" in value && (!nonEmpty && !value.length || value.length - 1 in value && _isObject(value[0])) && !value.nodeType && value !== _win$1;
}, _flatten = function _flatten2(ar, leaveStrings, accumulator) {
  if (accumulator === void 0) {
    accumulator = [];
  }
  return ar.forEach(function(value) {
    var _accumulator;
    return _isString(value) && !leaveStrings || _isArrayLike(value, 1) ? (_accumulator = accumulator).push.apply(_accumulator, toArray$1(value)) : accumulator.push(value);
  }) || accumulator;
}, toArray$1 = function toArray2(value, scope, leaveStrings) {
  return _context && !scope && _context.selector ? _context.selector(value) : _isString(value) && !leaveStrings && (_coreInitted || !_wake()) ? _slice.call((scope || _doc$1).querySelectorAll(value), 0) : _isArray(value) ? _flatten(value, leaveStrings) : _isArrayLike(value) ? _slice.call(value, 0) : value ? [value] : [];
}, selector = function selector2(value) {
  value = toArray$1(value)[0] || _warn("Invalid scope") || {};
  return function(v) {
    var el = value.current || value.nativeElement || value;
    return toArray$1(v, el.querySelectorAll ? el : el === value ? _warn("Invalid scope") || _doc$1.createElement("div") : value);
  };
}, shuffle = function shuffle2(a) {
  return a.sort(function() {
    return 0.5 - Math.random();
  });
}, distribute = function distribute2(v) {
  if (_isFunction(v)) {
    return v;
  }
  var vars = _isObject(v) ? v : {
    each: v
  }, ease = _parseEase(vars.ease), from = vars.from || 0, base = parseFloat(vars.base) || 0, cache2 = {}, isDecimal = from > 0 && from < 1, ratios = isNaN(from) || isDecimal, axis = vars.axis, ratioX = from, ratioY = from;
  if (_isString(from)) {
    ratioX = ratioY = {
      center: 0.5,
      edges: 0.5,
      end: 1
    }[from] || 0;
  } else if (!isDecimal && ratios) {
    ratioX = from[0];
    ratioY = from[1];
  }
  return function(i, target, a) {
    var l = (a || vars).length, distances = cache2[l], originX, originY, x, y, d, j, max2, min2, wrapAt;
    if (!distances) {
      wrapAt = vars.grid === "auto" ? 0 : (vars.grid || [1, _bigNum$1])[1];
      if (!wrapAt) {
        max2 = -_bigNum$1;
        while (max2 < (max2 = a[wrapAt++].getBoundingClientRect().left) && wrapAt < l) {
        }
        wrapAt < l && wrapAt--;
      }
      distances = cache2[l] = [];
      originX = ratios ? Math.min(wrapAt, l) * ratioX - 0.5 : from % wrapAt;
      originY = wrapAt === _bigNum$1 ? 0 : ratios ? l * ratioY / wrapAt - 0.5 : from / wrapAt | 0;
      max2 = 0;
      min2 = _bigNum$1;
      for (j = 0; j < l; j++) {
        x = j % wrapAt - originX;
        y = originY - (j / wrapAt | 0);
        distances[j] = d = !axis ? _sqrt(x * x + y * y) : Math.abs(axis === "y" ? y : x);
        d > max2 && (max2 = d);
        d < min2 && (min2 = d);
      }
      from === "random" && shuffle(distances);
      distances.max = max2 - min2;
      distances.min = min2;
      distances.v = l = (parseFloat(vars.amount) || parseFloat(vars.each) * (wrapAt > l ? l - 1 : !axis ? Math.max(wrapAt, l / wrapAt) : axis === "y" ? l / wrapAt : wrapAt) || 0) * (from === "edges" ? -1 : 1);
      distances.b = l < 0 ? base - l : base;
      distances.u = getUnit(vars.amount || vars.each) || 0;
      ease = ease && l < 0 ? _invertEase(ease) : ease;
    }
    l = (distances[i] - distances.min) / distances.max || 0;
    return _roundPrecise(distances.b + (ease ? ease(l) : l) * distances.v) + distances.u;
  };
}, _roundModifier = function _roundModifier2(v) {
  var p = Math.pow(10, ((v + "").split(".")[1] || "").length);
  return function(raw) {
    var n = _roundPrecise(Math.round(parseFloat(raw) / v) * v * p);
    return (n - n % 1) / p + (_isNumber(raw) ? 0 : getUnit(raw));
  };
}, snap = function snap2(snapTo, value) {
  var isArray2 = _isArray(snapTo), radius, is2D;
  if (!isArray2 && _isObject(snapTo)) {
    radius = isArray2 = snapTo.radius || _bigNum$1;
    if (snapTo.values) {
      snapTo = toArray$1(snapTo.values);
      if (is2D = !_isNumber(snapTo[0])) {
        radius *= radius;
      }
    } else {
      snapTo = _roundModifier(snapTo.increment);
    }
  }
  return _conditionalReturn(value, !isArray2 ? _roundModifier(snapTo) : _isFunction(snapTo) ? function(raw) {
    is2D = snapTo(raw);
    return Math.abs(is2D - raw) <= radius ? is2D : raw;
  } : function(raw) {
    var x = parseFloat(is2D ? raw.x : raw), y = parseFloat(is2D ? raw.y : 0), min2 = _bigNum$1, closest = 0, i = snapTo.length, dx, dy;
    while (i--) {
      if (is2D) {
        dx = snapTo[i].x - x;
        dy = snapTo[i].y - y;
        dx = dx * dx + dy * dy;
      } else {
        dx = Math.abs(snapTo[i] - x);
      }
      if (dx < min2) {
        min2 = dx;
        closest = i;
      }
    }
    closest = !radius || min2 <= radius ? snapTo[closest] : raw;
    return is2D || closest === raw || _isNumber(raw) ? closest : closest + getUnit(raw);
  });
}, random = function random2(min2, max2, roundingIncrement, returnFunction) {
  return _conditionalReturn(_isArray(min2) ? !max2 : roundingIncrement === true ? !!(roundingIncrement = 0) : !returnFunction, function() {
    return _isArray(min2) ? min2[~~(Math.random() * min2.length)] : (roundingIncrement = roundingIncrement || 1e-5) && (returnFunction = roundingIncrement < 1 ? Math.pow(10, (roundingIncrement + "").length - 2) : 1) && Math.floor(Math.round((min2 - roundingIncrement / 2 + Math.random() * (max2 - min2 + roundingIncrement * 0.99)) / roundingIncrement) * roundingIncrement * returnFunction) / returnFunction;
  });
}, pipe = function pipe2() {
  for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) {
    functions[_key] = arguments[_key];
  }
  return function(value) {
    return functions.reduce(function(v, f) {
      return f(v);
    }, value);
  };
}, unitize = function unitize2(func, unit) {
  return function(value) {
    return func(parseFloat(value)) + (unit || getUnit(value));
  };
}, normalize = function normalize2(min2, max2, value) {
  return mapRange(min2, max2, 0, 1, value);
}, _wrapArray = function _wrapArray2(a, wrapper, value) {
  return _conditionalReturn(value, function(index) {
    return a[~~wrapper(index)];
  });
}, wrap = function wrap2(min2, max2, value) {
  var range = max2 - min2;
  return _isArray(min2) ? _wrapArray(min2, wrap2(0, min2.length), max2) : _conditionalReturn(value, function(value2) {
    return (range + (value2 - min2) % range) % range + min2;
  });
}, wrapYoyo = function wrapYoyo2(min2, max2, value) {
  var range = max2 - min2, total = range * 2;
  return _isArray(min2) ? _wrapArray(min2, wrapYoyo2(0, min2.length - 1), max2) : _conditionalReturn(value, function(value2) {
    value2 = (total + (value2 - min2) % total) % total || 0;
    return min2 + (value2 > range ? total - value2 : value2);
  });
}, _replaceRandom = function _replaceRandom2(value) {
  var prev = 0, s = "", i, nums, end2, isArray2;
  while (~(i = value.indexOf("random(", prev))) {
    end2 = value.indexOf(")", i);
    isArray2 = value.charAt(i + 7) === "[";
    nums = value.substr(i + 7, end2 - i - 7).match(isArray2 ? _delimitedValueExp : _strictNumExp);
    s += value.substr(prev, i - prev) + random(isArray2 ? nums : +nums[0], isArray2 ? 0 : +nums[1], +nums[2] || 1e-5);
    prev = end2 + 1;
  }
  return s + value.substr(prev, value.length - prev);
}, mapRange = function mapRange2(inMin, inMax, outMin, outMax, value) {
  var inRange2 = inMax - inMin, outRange = outMax - outMin;
  return _conditionalReturn(value, function(value2) {
    return outMin + ((value2 - inMin) / inRange2 * outRange || 0);
  });
}, interpolate = function interpolate2(start2, end2, progress, mutate) {
  var func = isNaN(start2 + end2) ? 0 : function(p2) {
    return (1 - p2) * start2 + p2 * end2;
  };
  if (!func) {
    var isString2 = _isString(start2), master = {}, p, i, interpolators, l, il;
    progress === true && (mutate = 1) && (progress = null);
    if (isString2) {
      start2 = {
        p: start2
      };
      end2 = {
        p: end2
      };
    } else if (_isArray(start2) && !_isArray(end2)) {
      interpolators = [];
      l = start2.length;
      il = l - 2;
      for (i = 1; i < l; i++) {
        interpolators.push(interpolate2(start2[i - 1], start2[i]));
      }
      l--;
      func = function func2(p2) {
        p2 *= l;
        var i2 = Math.min(il, ~~p2);
        return interpolators[i2](p2 - i2);
      };
      progress = end2;
    } else if (!mutate) {
      start2 = _merge(_isArray(start2) ? [] : {}, start2);
    }
    if (!interpolators) {
      for (p in end2) {
        _addPropTween.call(master, start2, p, "get", end2[p]);
      }
      func = function func2(p2) {
        return _renderPropTweens(p2, master) || (isString2 ? start2.p : start2);
      };
    }
  }
  return _conditionalReturn(progress, func);
}, _getLabelInDirection = function _getLabelInDirection2(timeline2, fromTime, backward) {
  var labels = timeline2.labels, min2 = _bigNum$1, p, distance, label;
  for (p in labels) {
    distance = labels[p] - fromTime;
    if (distance < 0 === !!backward && distance && min2 > (distance = Math.abs(distance))) {
      label = p;
      min2 = distance;
    }
  }
  return label;
}, _callback = function _callback2(animation, type, executeLazyFirst) {
  var v = animation.vars, callback = v[type], prevContext = _context, context3 = animation._ctx, params, scope, result;
  if (!callback) {
    return;
  }
  params = v[type + "Params"];
  scope = v.callbackScope || animation;
  executeLazyFirst && _lazyTweens.length && _lazyRender();
  context3 && (_context = context3);
  result = params ? callback.apply(scope, params) : callback.call(scope);
  _context = prevContext;
  return result;
}, _interrupt = function _interrupt2(animation) {
  _removeFromParent(animation);
  animation.scrollTrigger && animation.scrollTrigger.kill(!!_reverting$1);
  animation.progress() < 1 && _callback(animation, "onInterrupt");
  return animation;
}, _quickTween, _registerPluginQueue = [], _createPlugin = function _createPlugin2(config3) {
  if (!config3) return;
  config3 = !config3.name && config3["default"] || config3;
  if (_windowExists$1() || config3.headless) {
    var name = config3.name, isFunc = _isFunction(config3), Plugin = name && !isFunc && config3.init ? function() {
      this._props = [];
    } : config3, instanceDefaults = {
      init: _emptyFunc,
      render: _renderPropTweens,
      add: _addPropTween,
      kill: _killPropTweensOf,
      modifier: _addPluginModifier,
      rawVars: 0
    }, statics = {
      targetTest: 0,
      get: 0,
      getSetter: _getSetter,
      aliases: {},
      register: 0
    };
    _wake();
    if (config3 !== Plugin) {
      if (_plugins[name]) {
        return;
      }
      _setDefaults(Plugin, _setDefaults(_copyExcluding(config3, instanceDefaults), statics));
      _merge(Plugin.prototype, _merge(instanceDefaults, _copyExcluding(config3, statics)));
      _plugins[Plugin.prop = name] = Plugin;
      if (config3.targetTest) {
        _harnessPlugins.push(Plugin);
        _reservedProps[name] = 1;
      }
      name = (name === "css" ? "CSS" : name.charAt(0).toUpperCase() + name.substr(1)) + "Plugin";
    }
    _addGlobal(name, Plugin);
    config3.register && config3.register(gsap, Plugin, PropTween);
  } else {
    _registerPluginQueue.push(config3);
  }
}, _255 = 255, _colorLookup = {
  aqua: [0, _255, _255],
  lime: [0, _255, 0],
  silver: [192, 192, 192],
  black: [0, 0, 0],
  maroon: [128, 0, 0],
  teal: [0, 128, 128],
  blue: [0, 0, _255],
  navy: [0, 0, 128],
  white: [_255, _255, _255],
  olive: [128, 128, 0],
  yellow: [_255, _255, 0],
  orange: [_255, 165, 0],
  gray: [128, 128, 128],
  purple: [128, 0, 128],
  green: [0, 128, 0],
  red: [_255, 0, 0],
  pink: [_255, 192, 203],
  cyan: [0, _255, _255],
  transparent: [_255, _255, _255, 0]
}, _hue = function _hue2(h, m1, m2) {
  h += h < 0 ? 1 : h > 1 ? -1 : 0;
  return (h * 6 < 1 ? m1 + (m2 - m1) * h * 6 : h < 0.5 ? m2 : h * 3 < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * _255 + 0.5 | 0;
}, splitColor = function splitColor2(v, toHSL, forceAlpha) {
  var a = !v ? _colorLookup.black : _isNumber(v) ? [v >> 16, v >> 8 & _255, v & _255] : 0, r, g, b, h, s, l, max2, min2, d, wasHSL;
  if (!a) {
    if (v.substr(-1) === ",") {
      v = v.substr(0, v.length - 1);
    }
    if (_colorLookup[v]) {
      a = _colorLookup[v];
    } else if (v.charAt(0) === "#") {
      if (v.length < 6) {
        r = v.charAt(1);
        g = v.charAt(2);
        b = v.charAt(3);
        v = "#" + r + r + g + g + b + b + (v.length === 5 ? v.charAt(4) + v.charAt(4) : "");
      }
      if (v.length === 9) {
        a = parseInt(v.substr(1, 6), 16);
        return [a >> 16, a >> 8 & _255, a & _255, parseInt(v.substr(7), 16) / 255];
      }
      v = parseInt(v.substr(1), 16);
      a = [v >> 16, v >> 8 & _255, v & _255];
    } else if (v.substr(0, 3) === "hsl") {
      a = wasHSL = v.match(_strictNumExp);
      if (!toHSL) {
        h = +a[0] % 360 / 360;
        s = +a[1] / 100;
        l = +a[2] / 100;
        g = l <= 0.5 ? l * (s + 1) : l + s - l * s;
        r = l * 2 - g;
        a.length > 3 && (a[3] *= 1);
        a[0] = _hue(h + 1 / 3, r, g);
        a[1] = _hue(h, r, g);
        a[2] = _hue(h - 1 / 3, r, g);
      } else if (~v.indexOf("=")) {
        a = v.match(_numExp);
        forceAlpha && a.length < 4 && (a[3] = 1);
        return a;
      }
    } else {
      a = v.match(_strictNumExp) || _colorLookup.transparent;
    }
    a = a.map(Number);
  }
  if (toHSL && !wasHSL) {
    r = a[0] / _255;
    g = a[1] / _255;
    b = a[2] / _255;
    max2 = Math.max(r, g, b);
    min2 = Math.min(r, g, b);
    l = (max2 + min2) / 2;
    if (max2 === min2) {
      h = s = 0;
    } else {
      d = max2 - min2;
      s = l > 0.5 ? d / (2 - max2 - min2) : d / (max2 + min2);
      h = max2 === r ? (g - b) / d + (g < b ? 6 : 0) : max2 === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    a[0] = ~~(h + 0.5);
    a[1] = ~~(s * 100 + 0.5);
    a[2] = ~~(l * 100 + 0.5);
  }
  forceAlpha && a.length < 4 && (a[3] = 1);
  return a;
}, _colorOrderData = function _colorOrderData2(v) {
  var values = [], c = [], i = -1;
  v.split(_colorExp).forEach(function(v2) {
    var a = v2.match(_numWithUnitExp) || [];
    values.push.apply(values, a);
    c.push(i += a.length + 1);
  });
  values.c = c;
  return values;
}, _formatColors = function _formatColors2(s, toHSL, orderMatchData) {
  var result = "", colors = (s + result).match(_colorExp), type = toHSL ? "hsla(" : "rgba(", i = 0, c, shell, d, l;
  if (!colors) {
    return s;
  }
  colors = colors.map(function(color) {
    return (color = splitColor(color, toHSL, 1)) && type + (toHSL ? color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : color.join(",")) + ")";
  });
  if (orderMatchData) {
    d = _colorOrderData(s);
    c = orderMatchData.c;
    if (c.join(result) !== d.c.join(result)) {
      shell = s.replace(_colorExp, "1").split(_numWithUnitExp);
      l = shell.length - 1;
      for (; i < l; i++) {
        result += shell[i] + (~c.indexOf(i) ? colors.shift() || type + "0,0,0,0)" : (d.length ? d : colors.length ? colors : orderMatchData).shift());
      }
    }
  }
  if (!shell) {
    shell = s.split(_colorExp);
    l = shell.length - 1;
    for (; i < l; i++) {
      result += shell[i] + colors[i];
    }
  }
  return result + shell[l];
}, _colorExp = (function() {
  var s = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", p;
  for (p in _colorLookup) {
    s += "|" + p + "\\b";
  }
  return new RegExp(s + ")", "gi");
})(), _hslExp = /hsl[a]?\(/, _colorStringFilter = function _colorStringFilter2(a) {
  var combined = a.join(" "), toHSL;
  _colorExp.lastIndex = 0;
  if (_colorExp.test(combined)) {
    toHSL = _hslExp.test(combined);
    a[1] = _formatColors(a[1], toHSL);
    a[0] = _formatColors(a[0], toHSL, _colorOrderData(a[1]));
    return true;
  }
}, _tickerActive, _ticker = (function() {
  var _getTime = Date.now, _lagThreshold = 500, _adjustedLag = 33, _startTime = _getTime(), _lastUpdate = _startTime, _gap = 1e3 / 240, _nextTime = _gap, _listeners2 = [], _id, _req, _raf, _self, _delta, _i, _tick = function _tick2(v) {
    var elapsed = _getTime() - _lastUpdate, manual = v === true, overlap, dispatch, time, frame;
    (elapsed > _lagThreshold || elapsed < 0) && (_startTime += elapsed - _adjustedLag);
    _lastUpdate += elapsed;
    time = _lastUpdate - _startTime;
    overlap = time - _nextTime;
    if (overlap > 0 || manual) {
      frame = ++_self.frame;
      _delta = time - _self.time * 1e3;
      _self.time = time = time / 1e3;
      _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
      dispatch = 1;
    }
    manual || (_id = _req(_tick2));
    if (dispatch) {
      for (_i = 0; _i < _listeners2.length; _i++) {
        _listeners2[_i](time, _delta, frame, v);
      }
    }
  };
  _self = {
    time: 0,
    frame: 0,
    tick: function tick() {
      _tick(true);
    },
    deltaRatio: function deltaRatio(fps) {
      return _delta / (1e3 / (fps || 60));
    },
    wake: function wake() {
      if (_coreReady) {
        if (!_coreInitted && _windowExists$1()) {
          _win$1 = _coreInitted = window;
          _doc$1 = _win$1.document || {};
          _globals.gsap = gsap;
          (_win$1.gsapVersions || (_win$1.gsapVersions = [])).push(gsap.version);
          _install(_installScope || _win$1.GreenSockGlobals || !_win$1.gsap && _win$1 || {});
          _registerPluginQueue.forEach(_createPlugin);
        }
        _raf = typeof requestAnimationFrame !== "undefined" && requestAnimationFrame;
        _id && _self.sleep();
        _req = _raf || function(f) {
          return setTimeout(f, _nextTime - _self.time * 1e3 + 1 | 0);
        };
        _tickerActive = 1;
        _tick(2);
      }
    },
    sleep: function sleep() {
      (_raf ? cancelAnimationFrame : clearTimeout)(_id);
      _tickerActive = 0;
      _req = _emptyFunc;
    },
    lagSmoothing: function lagSmoothing(threshold, adjustedLag) {
      _lagThreshold = threshold || Infinity;
      _adjustedLag = Math.min(adjustedLag || 33, _lagThreshold);
    },
    fps: function fps(_fps) {
      _gap = 1e3 / (_fps || 240);
      _nextTime = _self.time * 1e3 + _gap;
    },
    add: function add(callback, once, prioritize) {
      var func = once ? function(t, d, f, v) {
        callback(t, d, f, v);
        _self.remove(func);
      } : callback;
      _self.remove(callback);
      _listeners2[prioritize ? "unshift" : "push"](func);
      _wake();
      return func;
    },
    remove: function remove2(callback, i) {
      ~(i = _listeners2.indexOf(callback)) && _listeners2.splice(i, 1) && _i >= i && _i--;
    },
    _listeners: _listeners2
  };
  return _self;
})(), _wake = function _wake2() {
  return !_tickerActive && _ticker.wake();
}, _easeMap = {}, _customEaseExp = /^[\d.\-M][\d.\-,\s]/, _quotesExp = /["']/g, _parseObjectInString = function _parseObjectInString2(value) {
  var obj = {}, split2 = value.substr(1, value.length - 3).split(":"), key = split2[0], i = 1, l = split2.length, index, val, parsedVal;
  for (; i < l; i++) {
    val = split2[i];
    index = i !== l - 1 ? val.lastIndexOf(",") : val.length;
    parsedVal = val.substr(0, index);
    obj[key] = isNaN(parsedVal) ? parsedVal.replace(_quotesExp, "").trim() : +parsedVal;
    key = val.substr(index + 1).trim();
  }
  return obj;
}, _valueInParentheses = function _valueInParentheses2(value) {
  var open = value.indexOf("(") + 1, close = value.indexOf(")"), nested = value.indexOf("(", open);
  return value.substring(open, ~nested && nested < close ? value.indexOf(")", close + 1) : close);
}, _configEaseFromString = function _configEaseFromString2(name) {
  var split2 = (name + "").split("("), ease = _easeMap[split2[0]];
  return ease && split2.length > 1 && ease.config ? ease.config.apply(null, ~name.indexOf("{") ? [_parseObjectInString(split2[1])] : _valueInParentheses(name).split(",").map(_numericIfPossible)) : _easeMap._CE && _customEaseExp.test(name) ? _easeMap._CE("", name) : ease;
}, _invertEase = function _invertEase2(ease) {
  return function(p) {
    return 1 - ease(1 - p);
  };
}, _propagateYoyoEase = function _propagateYoyoEase2(timeline2, isYoyo) {
  var child = timeline2._first, ease;
  while (child) {
    if (child instanceof Timeline) {
      _propagateYoyoEase2(child, isYoyo);
    } else if (child.vars.yoyoEase && (!child._yoyo || !child._repeat) && child._yoyo !== isYoyo) {
      if (child.timeline) {
        _propagateYoyoEase2(child.timeline, isYoyo);
      } else {
        ease = child._ease;
        child._ease = child._yEase;
        child._yEase = ease;
        child._yoyo = isYoyo;
      }
    }
    child = child._next;
  }
}, _parseEase = function _parseEase2(ease, defaultEase) {
  return !ease ? defaultEase : (_isFunction(ease) ? ease : _easeMap[ease] || _configEaseFromString(ease)) || defaultEase;
}, _insertEase = function _insertEase2(names, easeIn, easeOut, easeInOut) {
  if (easeOut === void 0) {
    easeOut = function easeOut2(p) {
      return 1 - easeIn(1 - p);
    };
  }
  if (easeInOut === void 0) {
    easeInOut = function easeInOut2(p) {
      return p < 0.5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2;
    };
  }
  var ease = {
    easeIn,
    easeOut,
    easeInOut
  }, lowercaseName;
  _forEachName(names, function(name) {
    _easeMap[name] = _globals[name] = ease;
    _easeMap[lowercaseName = name.toLowerCase()] = easeOut;
    for (var p in ease) {
      _easeMap[lowercaseName + (p === "easeIn" ? ".in" : p === "easeOut" ? ".out" : ".inOut")] = _easeMap[name + "." + p] = ease[p];
    }
  });
  return ease;
}, _easeInOutFromOut = function _easeInOutFromOut2(easeOut) {
  return function(p) {
    return p < 0.5 ? (1 - easeOut(1 - p * 2)) / 2 : 0.5 + easeOut((p - 0.5) * 2) / 2;
  };
}, _configElastic = function _configElastic2(type, amplitude, period) {
  var p1 = amplitude >= 1 ? amplitude : 1, p2 = (period || (type ? 0.3 : 0.45)) / (amplitude < 1 ? amplitude : 1), p3 = p2 / _2PI * (Math.asin(1 / p1) || 0), easeOut = function easeOut2(p) {
    return p === 1 ? 1 : p1 * Math.pow(2, -10 * p) * _sin((p - p3) * p2) + 1;
  }, ease = type === "out" ? easeOut : type === "in" ? function(p) {
    return 1 - easeOut(1 - p);
  } : _easeInOutFromOut(easeOut);
  p2 = _2PI / p2;
  ease.config = function(amplitude2, period2) {
    return _configElastic2(type, amplitude2, period2);
  };
  return ease;
}, _configBack = function _configBack2(type, overshoot) {
  if (overshoot === void 0) {
    overshoot = 1.70158;
  }
  var easeOut = function easeOut2(p) {
    return p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0;
  }, ease = type === "out" ? easeOut : type === "in" ? function(p) {
    return 1 - easeOut(1 - p);
  } : _easeInOutFromOut(easeOut);
  ease.config = function(overshoot2) {
    return _configBack2(type, overshoot2);
  };
  return ease;
};
_forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", function(name, i) {
  var power = i < 5 ? i + 1 : i;
  _insertEase(name + ",Power" + (power - 1), i ? function(p) {
    return Math.pow(p, power);
  } : function(p) {
    return p;
  }, function(p) {
    return 1 - Math.pow(1 - p, power);
  }, function(p) {
    return p < 0.5 ? Math.pow(p * 2, power) / 2 : 1 - Math.pow((1 - p) * 2, power) / 2;
  });
});
_easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;
_insertEase("Elastic", _configElastic("in"), _configElastic("out"), _configElastic());
(function(n, c) {
  var n1 = 1 / c, n2 = 2 * n1, n3 = 2.5 * n1, easeOut = function easeOut2(p) {
    return p < n1 ? n * p * p : p < n2 ? n * Math.pow(p - 1.5 / c, 2) + 0.75 : p < n3 ? n * (p -= 2.25 / c) * p + 0.9375 : n * Math.pow(p - 2.625 / c, 2) + 0.984375;
  };
  _insertEase("Bounce", function(p) {
    return 1 - easeOut(1 - p);
  }, easeOut);
})(7.5625, 2.75);
_insertEase("Expo", function(p) {
  return Math.pow(2, 10 * (p - 1)) * p + p * p * p * p * p * p * (1 - p);
});
_insertEase("Circ", function(p) {
  return -(_sqrt(1 - p * p) - 1);
});
_insertEase("Sine", function(p) {
  return p === 1 ? 1 : -_cos(p * _HALF_PI) + 1;
});
_insertEase("Back", _configBack("in"), _configBack("out"), _configBack());
_easeMap.SteppedEase = _easeMap.steps = _globals.SteppedEase = {
  config: function config(steps, immediateStart) {
    if (steps === void 0) {
      steps = 1;
    }
    var p1 = 1 / steps, p2 = steps + (immediateStart ? 0 : 1), p3 = immediateStart ? 1 : 0, max2 = 1 - _tinyNum;
    return function(p) {
      return ((p2 * _clamp(0, max2, p) | 0) + p3) * p1;
    };
  }
};
_defaults$1.ease = _easeMap["quad.out"];
_forEachName("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(name) {
  return _callbackNames += name + "," + name + "Params,";
});
var GSCache = function GSCache2(target, harness) {
  this.id = _gsID++;
  target._gsap = this;
  this.target = target;
  this.harness = harness;
  this.get = harness ? harness.get : _getProperty;
  this.set = harness ? harness.getSetter : _getSetter;
};
var Animation = /* @__PURE__ */ (function() {
  function Animation2(vars) {
    this.vars = vars;
    this._delay = +vars.delay || 0;
    if (this._repeat = vars.repeat === Infinity ? -2 : vars.repeat || 0) {
      this._rDelay = vars.repeatDelay || 0;
      this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
    }
    this._ts = 1;
    _setDuration(this, +vars.duration, 1, 1);
    this.data = vars.data;
    if (_context) {
      this._ctx = _context;
      _context.data.push(this);
    }
    _tickerActive || _ticker.wake();
  }
  var _proto = Animation2.prototype;
  _proto.delay = function delay(value) {
    if (value || value === 0) {
      this.parent && this.parent.smoothChildTiming && this.startTime(this._start + value - this._delay);
      this._delay = value;
      return this;
    }
    return this._delay;
  };
  _proto.duration = function duration(value) {
    return arguments.length ? this.totalDuration(this._repeat > 0 ? value + (value + this._rDelay) * this._repeat : value) : this.totalDuration() && this._dur;
  };
  _proto.totalDuration = function totalDuration(value) {
    if (!arguments.length) {
      return this._tDur;
    }
    this._dirty = 0;
    return _setDuration(this, this._repeat < 0 ? value : (value - this._repeat * this._rDelay) / (this._repeat + 1));
  };
  _proto.totalTime = function totalTime(_totalTime, suppressEvents) {
    _wake();
    if (!arguments.length) {
      return this._tTime;
    }
    var parent = this._dp;
    if (parent && parent.smoothChildTiming && this._ts) {
      _alignPlayhead(this, _totalTime);
      !parent._dp || parent.parent || _postAddChecks(parent, this);
      while (parent && parent.parent) {
        if (parent.parent._time !== parent._start + (parent._ts >= 0 ? parent._tTime / parent._ts : (parent.totalDuration() - parent._tTime) / -parent._ts)) {
          parent.totalTime(parent._tTime, true);
        }
        parent = parent.parent;
      }
      if (!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && _totalTime < this._tDur || this._ts < 0 && _totalTime > 0 || !this._tDur && !_totalTime)) {
        _addToTimeline(this._dp, this, this._start - this._delay);
      }
    }
    if (this._tTime !== _totalTime || !this._dur && !suppressEvents || this._initted && Math.abs(this._zTime) === _tinyNum || !_totalTime && !this._initted && (this.add || this._ptLookup)) {
      this._ts || (this._pTime = _totalTime);
      _lazySafeRender(this, _totalTime, suppressEvents);
    }
    return this;
  };
  _proto.time = function time(value, suppressEvents) {
    return arguments.length ? this.totalTime(Math.min(this.totalDuration(), value + _elapsedCycleDuration(this)) % (this._dur + this._rDelay) || (value ? this._dur : 0), suppressEvents) : this._time;
  };
  _proto.totalProgress = function totalProgress(value, suppressEvents) {
    return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
  };
  _proto.progress = function progress(value, suppressEvents) {
    return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - value : value) + _elapsedCycleDuration(this), suppressEvents) : this.duration() ? Math.min(1, this._time / this._dur) : this.rawTime() > 0 ? 1 : 0;
  };
  _proto.iteration = function iteration(value, suppressEvents) {
    var cycleDuration = this.duration() + this._rDelay;
    return arguments.length ? this.totalTime(this._time + (value - 1) * cycleDuration, suppressEvents) : this._repeat ? _animationCycle(this._tTime, cycleDuration) + 1 : 1;
  };
  _proto.timeScale = function timeScale(value, suppressEvents) {
    if (!arguments.length) {
      return this._rts === -_tinyNum ? 0 : this._rts;
    }
    if (this._rts === value) {
      return this;
    }
    var tTime = this.parent && this._ts ? _parentToChildTotalTime(this.parent._time, this) : this._tTime;
    this._rts = +value || 0;
    this._ts = this._ps || value === -_tinyNum ? 0 : this._rts;
    this.totalTime(_clamp(-Math.abs(this._delay), this.totalDuration(), tTime), suppressEvents !== false);
    _setEnd(this);
    return _recacheAncestors(this);
  };
  _proto.paused = function paused(value) {
    if (!arguments.length) {
      return this._ps;
    }
    if (this._ps !== value) {
      this._ps = value;
      if (value) {
        this._pTime = this._tTime || Math.max(-this._delay, this.rawTime());
        this._ts = this._act = 0;
      } else {
        _wake();
        this._ts = this._rts;
        this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== _tinyNum && (this._tTime -= _tinyNum));
      }
    }
    return this;
  };
  _proto.startTime = function startTime(value) {
    if (arguments.length) {
      this._start = value;
      var parent = this.parent || this._dp;
      parent && (parent._sort || !this.parent) && _addToTimeline(parent, this, value - this._delay);
      return this;
    }
    return this._start;
  };
  _proto.endTime = function endTime(includeRepeats) {
    return this._start + (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
  };
  _proto.rawTime = function rawTime(wrapRepeats) {
    var parent = this.parent || this._dp;
    return !parent ? this._tTime : wrapRepeats && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : !this._ts ? this._tTime : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
  };
  _proto.revert = function revert(config3) {
    if (config3 === void 0) {
      config3 = _revertConfig;
    }
    var prevIsReverting = _reverting$1;
    _reverting$1 = config3;
    if (_isRevertWorthy(this)) {
      this.timeline && this.timeline.revert(config3);
      this.totalTime(-0.01, config3.suppressEvents);
    }
    this.data !== "nested" && config3.kill !== false && this.kill();
    _reverting$1 = prevIsReverting;
    return this;
  };
  _proto.globalTime = function globalTime(rawTime) {
    var animation = this, time = arguments.length ? rawTime : animation.rawTime();
    while (animation) {
      time = animation._start + time / (Math.abs(animation._ts) || 1);
      animation = animation._dp;
    }
    return !this.parent && this._sat ? this._sat.globalTime(rawTime) : time;
  };
  _proto.repeat = function repeat(value) {
    if (arguments.length) {
      this._repeat = value === Infinity ? -2 : value;
      return _onUpdateTotalDuration(this);
    }
    return this._repeat === -2 ? Infinity : this._repeat;
  };
  _proto.repeatDelay = function repeatDelay(value) {
    if (arguments.length) {
      var time = this._time;
      this._rDelay = value;
      _onUpdateTotalDuration(this);
      return time ? this.time(time) : this;
    }
    return this._rDelay;
  };
  _proto.yoyo = function yoyo(value) {
    if (arguments.length) {
      this._yoyo = value;
      return this;
    }
    return this._yoyo;
  };
  _proto.seek = function seek(position, suppressEvents) {
    return this.totalTime(_parsePosition(this, position), _isNotFalse(suppressEvents));
  };
  _proto.restart = function restart(includeDelay, suppressEvents) {
    this.play().totalTime(includeDelay ? -this._delay : 0, _isNotFalse(suppressEvents));
    this._dur || (this._zTime = -_tinyNum);
    return this;
  };
  _proto.play = function play(from, suppressEvents) {
    from != null && this.seek(from, suppressEvents);
    return this.reversed(false).paused(false);
  };
  _proto.reverse = function reverse(from, suppressEvents) {
    from != null && this.seek(from || this.totalDuration(), suppressEvents);
    return this.reversed(true).paused(false);
  };
  _proto.pause = function pause(atTime, suppressEvents) {
    atTime != null && this.seek(atTime, suppressEvents);
    return this.paused(true);
  };
  _proto.resume = function resume() {
    return this.paused(false);
  };
  _proto.reversed = function reversed(value) {
    if (arguments.length) {
      !!value !== this.reversed() && this.timeScale(-this._rts || (value ? -_tinyNum : 0));
      return this;
    }
    return this._rts < 0;
  };
  _proto.invalidate = function invalidate() {
    this._initted = this._act = 0;
    this._zTime = -_tinyNum;
    return this;
  };
  _proto.isActive = function isActive() {
    var parent = this.parent || this._dp, start2 = this._start, rawTime;
    return !!(!parent || this._ts && this._initted && parent.isActive() && (rawTime = parent.rawTime(true)) >= start2 && rawTime < this.endTime(true) - _tinyNum);
  };
  _proto.eventCallback = function eventCallback(type, callback, params) {
    var vars = this.vars;
    if (arguments.length > 1) {
      if (!callback) {
        delete vars[type];
      } else {
        vars[type] = callback;
        params && (vars[type + "Params"] = params);
        type === "onUpdate" && (this._onUpdate = callback);
      }
      return this;
    }
    return vars[type];
  };
  _proto.then = function then(onFulfilled) {
    var self = this;
    return new Promise(function(resolve) {
      var f = _isFunction(onFulfilled) ? onFulfilled : _passThrough, _resolve = function _resolve2() {
        var _then = self.then;
        self.then = null;
        _isFunction(f) && (f = f(self)) && (f.then || f === self) && (self.then = _then);
        resolve(f);
        self.then = _then;
      };
      if (self._initted && self.totalProgress() === 1 && self._ts >= 0 || !self._tTime && self._ts < 0) {
        _resolve();
      } else {
        self._prom = _resolve;
      }
    });
  };
  _proto.kill = function kill() {
    _interrupt(this);
  };
  return Animation2;
})();
_setDefaults(Animation.prototype, {
  _time: 0,
  _start: 0,
  _end: 0,
  _tTime: 0,
  _tDur: 0,
  _dirty: 0,
  _repeat: 0,
  _yoyo: false,
  parent: null,
  _initted: false,
  _rDelay: 0,
  _ts: 1,
  _dp: 0,
  ratio: 0,
  _zTime: -_tinyNum,
  _prom: 0,
  _ps: false,
  _rts: 1
});
var Timeline = /* @__PURE__ */ (function(_Animation) {
  _inheritsLoose(Timeline2, _Animation);
  function Timeline2(vars, position) {
    var _this;
    if (vars === void 0) {
      vars = {};
    }
    _this = _Animation.call(this, vars) || this;
    _this.labels = {};
    _this.smoothChildTiming = !!vars.smoothChildTiming;
    _this.autoRemoveChildren = !!vars.autoRemoveChildren;
    _this._sort = _isNotFalse(vars.sortChildren);
    _globalTimeline && _addToTimeline(vars.parent || _globalTimeline, _assertThisInitialized(_this), position);
    vars.reversed && _this.reverse();
    vars.paused && _this.paused(true);
    vars.scrollTrigger && _scrollTrigger(_assertThisInitialized(_this), vars.scrollTrigger);
    return _this;
  }
  var _proto2 = Timeline2.prototype;
  _proto2.to = function to(targets, vars, position) {
    _createTweenType(0, arguments, this);
    return this;
  };
  _proto2.from = function from(targets, vars, position) {
    _createTweenType(1, arguments, this);
    return this;
  };
  _proto2.fromTo = function fromTo(targets, fromVars, toVars, position) {
    _createTweenType(2, arguments, this);
    return this;
  };
  _proto2.set = function set2(targets, vars, position) {
    vars.duration = 0;
    vars.parent = this;
    _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
    vars.immediateRender = !!vars.immediateRender;
    new Tween(targets, vars, _parsePosition(this, position), 1);
    return this;
  };
  _proto2.call = function call(callback, params, position) {
    return _addToTimeline(this, Tween.delayedCall(0, callback, params), position);
  };
  _proto2.staggerTo = function staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
    vars.duration = duration;
    vars.stagger = vars.stagger || stagger;
    vars.onComplete = onCompleteAll;
    vars.onCompleteParams = onCompleteAllParams;
    vars.parent = this;
    new Tween(targets, vars, _parsePosition(this, position));
    return this;
  };
  _proto2.staggerFrom = function staggerFrom(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
    vars.runBackwards = 1;
    _inheritDefaults(vars).immediateRender = _isNotFalse(vars.immediateRender);
    return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams);
  };
  _proto2.staggerFromTo = function staggerFromTo(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams) {
    toVars.startAt = fromVars;
    _inheritDefaults(toVars).immediateRender = _isNotFalse(toVars.immediateRender);
    return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams);
  };
  _proto2.render = function render22(totalTime, suppressEvents, force) {
    var prevTime = this._time, tDur = this._dirty ? this.totalDuration() : this._tDur, dur = this._dur, tTime = totalTime <= 0 ? 0 : _roundPrecise(totalTime), crossingStart = this._zTime < 0 !== totalTime < 0 && (this._initted || !dur), time, child, next, iteration, cycleDuration, prevPaused, pauseTween, timeScale, prevStart, prevIteration, yoyo, isYoyo;
    this !== _globalTimeline && tTime > tDur && totalTime >= 0 && (tTime = tDur);
    if (tTime !== this._tTime || force || crossingStart) {
      if (prevTime !== this._time && dur) {
        tTime += this._time - prevTime;
        totalTime += this._time - prevTime;
      }
      time = tTime;
      prevStart = this._start;
      timeScale = this._ts;
      prevPaused = !timeScale;
      if (crossingStart) {
        dur || (prevTime = this._zTime);
        (totalTime || !suppressEvents) && (this._zTime = totalTime);
      }
      if (this._repeat) {
        yoyo = this._yoyo;
        cycleDuration = dur + this._rDelay;
        if (this._repeat < -1 && totalTime < 0) {
          return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
        }
        time = _roundPrecise(tTime % cycleDuration);
        if (tTime === tDur) {
          iteration = this._repeat;
          time = dur;
        } else {
          prevIteration = _roundPrecise(tTime / cycleDuration);
          iteration = ~~prevIteration;
          if (iteration && iteration === prevIteration) {
            time = dur;
            iteration--;
          }
          time > dur && (time = dur);
        }
        prevIteration = _animationCycle(this._tTime, cycleDuration);
        !prevTime && this._tTime && prevIteration !== iteration && this._tTime - prevIteration * cycleDuration - this._dur <= 0 && (prevIteration = iteration);
        if (yoyo && iteration & 1) {
          time = dur - time;
          isYoyo = 1;
        }
        if (iteration !== prevIteration && !this._lock) {
          var rewinding = yoyo && prevIteration & 1, doesWrap = rewinding === (yoyo && iteration & 1);
          iteration < prevIteration && (rewinding = !rewinding);
          prevTime = rewinding ? 0 : tTime % dur ? dur : tTime;
          this._lock = 1;
          this.render(prevTime || (isYoyo ? 0 : _roundPrecise(iteration * cycleDuration)), suppressEvents, !dur)._lock = 0;
          this._tTime = tTime;
          !suppressEvents && this.parent && _callback(this, "onRepeat");
          this.vars.repeatRefresh && !isYoyo && (this.invalidate()._lock = 1);
          if (prevTime && prevTime !== this._time || prevPaused !== !this._ts || this.vars.onRepeat && !this.parent && !this._act) {
            return this;
          }
          dur = this._dur;
          tDur = this._tDur;
          if (doesWrap) {
            this._lock = 2;
            prevTime = rewinding ? dur : -1e-4;
            this.render(prevTime, true);
            this.vars.repeatRefresh && !isYoyo && this.invalidate();
          }
          this._lock = 0;
          if (!this._ts && !prevPaused) {
            return this;
          }
          _propagateYoyoEase(this, isYoyo);
        }
      }
      if (this._hasPause && !this._forcing && this._lock < 2) {
        pauseTween = _findNextPauseTween(this, _roundPrecise(prevTime), _roundPrecise(time));
        if (pauseTween) {
          tTime -= time - (time = pauseTween._start);
        }
      }
      this._tTime = tTime;
      this._time = time;
      this._act = !timeScale;
      if (!this._initted) {
        this._onUpdate = this.vars.onUpdate;
        this._initted = 1;
        this._zTime = totalTime;
        prevTime = 0;
      }
      if (!prevTime && tTime && !suppressEvents && !prevIteration) {
        _callback(this, "onStart");
        if (this._tTime !== tTime) {
          return this;
        }
      }
      if (time >= prevTime && totalTime >= 0) {
        child = this._first;
        while (child) {
          next = child._next;
          if ((child._act || time >= child._start) && child._ts && pauseTween !== child) {
            if (child.parent !== this) {
              return this.render(totalTime, suppressEvents, force);
            }
            child.render(child._ts > 0 ? (time - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (time - child._start) * child._ts, suppressEvents, force);
            if (time !== this._time || !this._ts && !prevPaused) {
              pauseTween = 0;
              next && (tTime += this._zTime = -_tinyNum);
              break;
            }
          }
          child = next;
        }
      } else {
        child = this._last;
        var adjustedTime = totalTime < 0 ? totalTime : time;
        while (child) {
          next = child._prev;
          if ((child._act || adjustedTime <= child._end) && child._ts && pauseTween !== child) {
            if (child.parent !== this) {
              return this.render(totalTime, suppressEvents, force);
            }
            child.render(child._ts > 0 ? (adjustedTime - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (adjustedTime - child._start) * child._ts, suppressEvents, force || _reverting$1 && _isRevertWorthy(child));
            if (time !== this._time || !this._ts && !prevPaused) {
              pauseTween = 0;
              next && (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum);
              break;
            }
          }
          child = next;
        }
      }
      if (pauseTween && !suppressEvents) {
        this.pause();
        pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime = time >= prevTime ? 1 : -1;
        if (this._ts) {
          this._start = prevStart;
          _setEnd(this);
          return this.render(totalTime, suppressEvents, force);
        }
      }
      this._onUpdate && !suppressEvents && _callback(this, "onUpdate", true);
      if (tTime === tDur && this._tTime >= this.totalDuration() || !tTime && prevTime) {
        if (prevStart === this._start || Math.abs(timeScale) !== Math.abs(this._ts)) {
          if (!this._lock) {
            (totalTime || !dur) && (tTime === tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1);
            if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime || !tDur)) {
              _callback(this, tTime === tDur && totalTime >= 0 ? "onComplete" : "onReverseComplete", true);
              this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
            }
          }
        }
      }
    }
    return this;
  };
  _proto2.add = function add(child, position) {
    var _this2 = this;
    _isNumber(position) || (position = _parsePosition(this, position, child));
    if (!(child instanceof Animation)) {
      if (_isArray(child)) {
        child.forEach(function(obj) {
          return _this2.add(obj, position);
        });
        return this;
      }
      if (_isString(child)) {
        return this.addLabel(child, position);
      }
      if (_isFunction(child)) {
        child = Tween.delayedCall(0, child);
      } else {
        return this;
      }
    }
    return this !== child ? _addToTimeline(this, child, position) : this;
  };
  _proto2.getChildren = function getChildren2(nested, tweens, timelines, ignoreBeforeTime) {
    if (nested === void 0) {
      nested = true;
    }
    if (tweens === void 0) {
      tweens = true;
    }
    if (timelines === void 0) {
      timelines = true;
    }
    if (ignoreBeforeTime === void 0) {
      ignoreBeforeTime = -_bigNum$1;
    }
    var a = [], child = this._first;
    while (child) {
      if (child._start >= ignoreBeforeTime) {
        if (child instanceof Tween) {
          tweens && a.push(child);
        } else {
          timelines && a.push(child);
          nested && a.push.apply(a, child.getChildren(true, tweens, timelines));
        }
      }
      child = child._next;
    }
    return a;
  };
  _proto2.getById = function getById2(id) {
    var animations = this.getChildren(1, 1, 1), i = animations.length;
    while (i--) {
      if (animations[i].vars.id === id) {
        return animations[i];
      }
    }
  };
  _proto2.remove = function remove2(child) {
    if (_isString(child)) {
      return this.removeLabel(child);
    }
    if (_isFunction(child)) {
      return this.killTweensOf(child);
    }
    child.parent === this && _removeLinkedListItem(this, child);
    if (child === this._recent) {
      this._recent = this._last;
    }
    return _uncache(this);
  };
  _proto2.totalTime = function totalTime(_totalTime2, suppressEvents) {
    if (!arguments.length) {
      return this._tTime;
    }
    this._forcing = 1;
    if (!this._dp && this._ts) {
      this._start = _roundPrecise(_ticker.time - (this._ts > 0 ? _totalTime2 / this._ts : (this.totalDuration() - _totalTime2) / -this._ts));
    }
    _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);
    this._forcing = 0;
    return this;
  };
  _proto2.addLabel = function addLabel(label, position) {
    this.labels[label] = _parsePosition(this, position);
    return this;
  };
  _proto2.removeLabel = function removeLabel(label) {
    delete this.labels[label];
    return this;
  };
  _proto2.addPause = function addPause(position, callback, params) {
    var t = Tween.delayedCall(0, callback || _emptyFunc, params);
    t.data = "isPause";
    this._hasPause = 1;
    return _addToTimeline(this, t, _parsePosition(this, position));
  };
  _proto2.removePause = function removePause(position) {
    var child = this._first;
    position = _parsePosition(this, position);
    while (child) {
      if (child._start === position && child.data === "isPause") {
        _removeFromParent(child);
      }
      child = child._next;
    }
  };
  _proto2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
    var tweens = this.getTweensOf(targets, onlyActive), i = tweens.length;
    while (i--) {
      _overwritingTween !== tweens[i] && tweens[i].kill(targets, props);
    }
    return this;
  };
  _proto2.getTweensOf = function getTweensOf2(targets, onlyActive) {
    var a = [], parsedTargets = toArray$1(targets), child = this._first, isGlobalTime = _isNumber(onlyActive), children2;
    while (child) {
      if (child instanceof Tween) {
        if (_arrayContainsAny(child._targets, parsedTargets) && (isGlobalTime ? (!_overwritingTween || child._initted && child._ts) && child.globalTime(0) <= onlyActive && child.globalTime(child.totalDuration()) > onlyActive : !onlyActive || child.isActive())) {
          a.push(child);
        }
      } else if ((children2 = child.getTweensOf(parsedTargets, onlyActive)).length) {
        a.push.apply(a, children2);
      }
      child = child._next;
    }
    return a;
  };
  _proto2.tweenTo = function tweenTo(position, vars) {
    vars = vars || {};
    var tl = this, endTime = _parsePosition(tl, position), _vars = vars, startAt = _vars.startAt, _onStart = _vars.onStart, onStartParams = _vars.onStartParams, immediateRender = _vars.immediateRender, initted, tween = Tween.to(tl, _setDefaults({
      ease: vars.ease || "none",
      lazy: false,
      immediateRender: false,
      time: endTime,
      overwrite: "auto",
      duration: vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale()) || _tinyNum,
      onStart: function onStart() {
        tl.pause();
        if (!initted) {
          var duration = vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale());
          tween._dur !== duration && _setDuration(tween, duration, 0, 1).render(tween._time, true, true);
          initted = 1;
        }
        _onStart && _onStart.apply(tween, onStartParams || []);
      }
    }, vars));
    return immediateRender ? tween.render(0) : tween;
  };
  _proto2.tweenFromTo = function tweenFromTo(fromPosition, toPosition, vars) {
    return this.tweenTo(toPosition, _setDefaults({
      startAt: {
        time: _parsePosition(this, fromPosition)
      }
    }, vars));
  };
  _proto2.recent = function recent() {
    return this._recent;
  };
  _proto2.nextLabel = function nextLabel(afterTime) {
    if (afterTime === void 0) {
      afterTime = this._time;
    }
    return _getLabelInDirection(this, _parsePosition(this, afterTime));
  };
  _proto2.previousLabel = function previousLabel(beforeTime) {
    if (beforeTime === void 0) {
      beforeTime = this._time;
    }
    return _getLabelInDirection(this, _parsePosition(this, beforeTime), 1);
  };
  _proto2.currentLabel = function currentLabel(value) {
    return arguments.length ? this.seek(value, true) : this.previousLabel(this._time + _tinyNum);
  };
  _proto2.shiftChildren = function shiftChildren(amount, adjustLabels, ignoreBeforeTime) {
    if (ignoreBeforeTime === void 0) {
      ignoreBeforeTime = 0;
    }
    var child = this._first, labels = this.labels, p;
    while (child) {
      if (child._start >= ignoreBeforeTime) {
        child._start += amount;
        child._end += amount;
      }
      child = child._next;
    }
    if (adjustLabels) {
      for (p in labels) {
        if (labels[p] >= ignoreBeforeTime) {
          labels[p] += amount;
        }
      }
    }
    return _uncache(this);
  };
  _proto2.invalidate = function invalidate(soft) {
    var child = this._first;
    this._lock = 0;
    while (child) {
      child.invalidate(soft);
      child = child._next;
    }
    return _Animation.prototype.invalidate.call(this, soft);
  };
  _proto2.clear = function clear2(includeLabels) {
    if (includeLabels === void 0) {
      includeLabels = true;
    }
    var child = this._first, next;
    while (child) {
      next = child._next;
      this.remove(child);
      child = next;
    }
    this._dp && (this._time = this._tTime = this._pTime = 0);
    includeLabels && (this.labels = {});
    return _uncache(this);
  };
  _proto2.totalDuration = function totalDuration(value) {
    var max2 = 0, self = this, child = self._last, prevStart = _bigNum$1, prev, start2, parent;
    if (arguments.length) {
      return self.timeScale((self._repeat < 0 ? self.duration() : self.totalDuration()) / (self.reversed() ? -value : value));
    }
    if (self._dirty) {
      parent = self.parent;
      while (child) {
        prev = child._prev;
        child._dirty && child.totalDuration();
        start2 = child._start;
        if (start2 > prevStart && self._sort && child._ts && !self._lock) {
          self._lock = 1;
          _addToTimeline(self, child, start2 - child._delay, 1)._lock = 0;
        } else {
          prevStart = start2;
        }
        if (start2 < 0 && child._ts) {
          max2 -= start2;
          if (!parent && !self._dp || parent && parent.smoothChildTiming) {
            self._start += start2 / self._ts;
            self._time -= start2;
            self._tTime -= start2;
          }
          self.shiftChildren(-start2, false, -Infinity);
          prevStart = 0;
        }
        child._end > max2 && child._ts && (max2 = child._end);
        child = prev;
      }
      _setDuration(self, self === _globalTimeline && self._time > max2 ? self._time : max2, 1, 1);
      self._dirty = 0;
    }
    return self._tDur;
  };
  Timeline2.updateRoot = function updateRoot(time) {
    if (_globalTimeline._ts) {
      _lazySafeRender(_globalTimeline, _parentToChildTotalTime(time, _globalTimeline));
      _lastRenderedFrame = _ticker.frame;
    }
    if (_ticker.frame >= _nextGCFrame) {
      _nextGCFrame += _config.autoSleep || 120;
      var child = _globalTimeline._first;
      if (!child || !child._ts) {
        if (_config.autoSleep && _ticker._listeners.length < 2) {
          while (child && !child._ts) {
            child = child._next;
          }
          child || _ticker.sleep();
        }
      }
    }
  };
  return Timeline2;
})(Animation);
_setDefaults(Timeline.prototype, {
  _lock: 0,
  _hasPause: 0,
  _forcing: 0
});
var _addComplexStringPropTween = function _addComplexStringPropTween2(target, prop, start2, end2, setter, stringFilter, funcParam) {
  var pt = new PropTween(this._pt, target, prop, 0, 1, _renderComplexString, null, setter), index = 0, matchIndex = 0, result, startNums, color, endNum, chunk, startNum, hasRandom, a;
  pt.b = start2;
  pt.e = end2;
  start2 += "";
  end2 += "";
  if (hasRandom = ~end2.indexOf("random(")) {
    end2 = _replaceRandom(end2);
  }
  if (stringFilter) {
    a = [start2, end2];
    stringFilter(a, target, prop);
    start2 = a[0];
    end2 = a[1];
  }
  startNums = start2.match(_complexStringNumExp) || [];
  while (result = _complexStringNumExp.exec(end2)) {
    endNum = result[0];
    chunk = end2.substring(index, result.index);
    if (color) {
      color = (color + 1) % 5;
    } else if (chunk.substr(-5) === "rgba(") {
      color = 1;
    }
    if (endNum !== startNums[matchIndex++]) {
      startNum = parseFloat(startNums[matchIndex - 1]) || 0;
      pt._pt = {
        _next: pt._pt,
        p: chunk || matchIndex === 1 ? chunk : ",",
        //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
        s: startNum,
        c: endNum.charAt(1) === "=" ? _parseRelative(startNum, endNum) - startNum : parseFloat(endNum) - startNum,
        m: color && color < 4 ? Math.round : 0
      };
      index = _complexStringNumExp.lastIndex;
    }
  }
  pt.c = index < end2.length ? end2.substring(index, end2.length) : "";
  pt.fp = funcParam;
  if (_relExp.test(end2) || hasRandom) {
    pt.e = 0;
  }
  this._pt = pt;
  return pt;
}, _addPropTween = function _addPropTween2(target, prop, start2, end2, index, targets, modifier, stringFilter, funcParam, optional) {
  _isFunction(end2) && (end2 = end2(index || 0, target, targets));
  var currentValue = target[prop], parsedStart = start2 !== "get" ? start2 : !_isFunction(currentValue) ? currentValue : funcParam ? target[prop.indexOf("set") || !_isFunction(target["get" + prop.substr(3)]) ? prop : "get" + prop.substr(3)](funcParam) : target[prop](), setter = !_isFunction(currentValue) ? _setterPlain : funcParam ? _setterFuncWithParam : _setterFunc, pt;
  if (_isString(end2)) {
    if (~end2.indexOf("random(")) {
      end2 = _replaceRandom(end2);
    }
    if (end2.charAt(1) === "=") {
      pt = _parseRelative(parsedStart, end2) + (getUnit(parsedStart) || 0);
      if (pt || pt === 0) {
        end2 = pt;
      }
    }
  }
  if (!optional || parsedStart !== end2 || _forceAllPropTweens) {
    if (!isNaN(parsedStart * end2) && end2 !== "") {
      pt = new PropTween(this._pt, target, prop, +parsedStart || 0, end2 - (parsedStart || 0), typeof currentValue === "boolean" ? _renderBoolean : _renderPlain, 0, setter);
      funcParam && (pt.fp = funcParam);
      modifier && pt.modifier(modifier, this, target);
      return this._pt = pt;
    }
    !currentValue && !(prop in target) && _missingPlugin(prop, end2);
    return _addComplexStringPropTween.call(this, target, prop, parsedStart, end2, setter, stringFilter || _config.stringFilter, funcParam);
  }
}, _processVars = function _processVars2(vars, index, target, targets, tween) {
  _isFunction(vars) && (vars = _parseFuncOrString(vars, tween, index, target, targets));
  if (!_isObject(vars) || vars.style && vars.nodeType || _isArray(vars) || _isTypedArray(vars)) {
    return _isString(vars) ? _parseFuncOrString(vars, tween, index, target, targets) : vars;
  }
  var copy = {}, p;
  for (p in vars) {
    copy[p] = _parseFuncOrString(vars[p], tween, index, target, targets);
  }
  return copy;
}, _checkPlugin = function _checkPlugin2(property, vars, tween, index, target, targets) {
  var plugin, pt, ptLookup, i;
  if (_plugins[property] && (plugin = new _plugins[property]()).init(target, plugin.rawVars ? vars[property] : _processVars(vars[property], index, target, targets, tween), tween, index, targets) !== false) {
    tween._pt = pt = new PropTween(tween._pt, target, property, 0, 1, plugin.render, plugin, 0, plugin.priority);
    if (tween !== _quickTween) {
      ptLookup = tween._ptLookup[tween._targets.indexOf(target)];
      i = plugin._props.length;
      while (i--) {
        ptLookup[plugin._props[i]] = pt;
      }
    }
  }
  return plugin;
}, _overwritingTween, _forceAllPropTweens, _initTween = function _initTween2(tween, time, tTime) {
  var vars = tween.vars, ease = vars.ease, startAt = vars.startAt, immediateRender = vars.immediateRender, lazy = vars.lazy, onUpdate = vars.onUpdate, runBackwards = vars.runBackwards, yoyoEase = vars.yoyoEase, keyframes = vars.keyframes, autoRevert = vars.autoRevert, dur = tween._dur, prevStartAt = tween._startAt, targets = tween._targets, parent = tween.parent, fullTargets = parent && parent.data === "nested" ? parent.vars.targets : targets, autoOverwrite = tween._overwrite === "auto" && !_suppressOverwrites, tl = tween.timeline, cleanVars, i, p, pt, target, hasPriority, gsData, harness, plugin, ptLookup, index, harnessVars, overwritten;
  tl && (!keyframes || !ease) && (ease = "none");
  tween._ease = _parseEase(ease, _defaults$1.ease);
  tween._yEase = yoyoEase ? _invertEase(_parseEase(yoyoEase === true ? ease : yoyoEase, _defaults$1.ease)) : 0;
  if (yoyoEase && tween._yoyo && !tween._repeat) {
    yoyoEase = tween._yEase;
    tween._yEase = tween._ease;
    tween._ease = yoyoEase;
  }
  tween._from = !tl && !!vars.runBackwards;
  if (!tl || keyframes && !vars.stagger) {
    harness = targets[0] ? _getCache(targets[0]).harness : 0;
    harnessVars = harness && vars[harness.prop];
    cleanVars = _copyExcluding(vars, _reservedProps);
    if (prevStartAt) {
      prevStartAt._zTime < 0 && prevStartAt.progress(1);
      time < 0 && runBackwards && immediateRender && !autoRevert ? prevStartAt.render(-1, true) : prevStartAt.revert(runBackwards && dur ? _revertConfigNoKill : _startAtRevertConfig);
      prevStartAt._lazy = 0;
    }
    if (startAt) {
      _removeFromParent(tween._startAt = Tween.set(targets, _setDefaults({
        data: "isStart",
        overwrite: false,
        parent,
        immediateRender: true,
        lazy: !prevStartAt && _isNotFalse(lazy),
        startAt: null,
        delay: 0,
        onUpdate: onUpdate && function() {
          return _callback(tween, "onUpdate");
        },
        stagger: 0
      }, startAt)));
      tween._startAt._dp = 0;
      tween._startAt._sat = tween;
      time < 0 && (_reverting$1 || !immediateRender && !autoRevert) && tween._startAt.revert(_revertConfigNoKill);
      if (immediateRender) {
        if (dur && time <= 0 && tTime <= 0) {
          time && (tween._zTime = time);
          return;
        }
      }
    } else if (runBackwards && dur) {
      if (!prevStartAt) {
        time && (immediateRender = false);
        p = _setDefaults({
          overwrite: false,
          data: "isFromStart",
          //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
          lazy: immediateRender && !prevStartAt && _isNotFalse(lazy),
          immediateRender,
          //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
          stagger: 0,
          parent
          //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y: gsap.utils.wrap([-100,100]), stagger: 0.5})
        }, cleanVars);
        harnessVars && (p[harness.prop] = harnessVars);
        _removeFromParent(tween._startAt = Tween.set(targets, p));
        tween._startAt._dp = 0;
        tween._startAt._sat = tween;
        time < 0 && (_reverting$1 ? tween._startAt.revert(_revertConfigNoKill) : tween._startAt.render(-1, true));
        tween._zTime = time;
        if (!immediateRender) {
          _initTween2(tween._startAt, _tinyNum, _tinyNum);
        } else if (!time) {
          return;
        }
      }
    }
    tween._pt = tween._ptCache = 0;
    lazy = dur && _isNotFalse(lazy) || lazy && !dur;
    for (i = 0; i < targets.length; i++) {
      target = targets[i];
      gsData = target._gsap || _harness(targets)[i]._gsap;
      tween._ptLookup[i] = ptLookup = {};
      _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender();
      index = fullTargets === targets ? i : fullTargets.indexOf(target);
      if (harness && (plugin = new harness()).init(target, harnessVars || cleanVars, tween, index, fullTargets) !== false) {
        tween._pt = pt = new PropTween(tween._pt, target, plugin.name, 0, 1, plugin.render, plugin, 0, plugin.priority);
        plugin._props.forEach(function(name) {
          ptLookup[name] = pt;
        });
        plugin.priority && (hasPriority = 1);
      }
      if (!harness || harnessVars) {
        for (p in cleanVars) {
          if (_plugins[p] && (plugin = _checkPlugin(p, cleanVars, tween, index, target, fullTargets))) {
            plugin.priority && (hasPriority = 1);
          } else {
            ptLookup[p] = pt = _addPropTween.call(tween, target, p, "get", cleanVars[p], index, fullTargets, 0, vars.stringFilter);
          }
        }
      }
      tween._op && tween._op[i] && tween.kill(target, tween._op[i]);
      if (autoOverwrite && tween._pt) {
        _overwritingTween = tween;
        _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(time));
        overwritten = !tween.parent;
        _overwritingTween = 0;
      }
      tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
    }
    hasPriority && _sortPropTweensByPriority(tween);
    tween._onInit && tween._onInit(tween);
  }
  tween._onUpdate = onUpdate;
  tween._initted = (!tween._op || tween._pt) && !overwritten;
  keyframes && time <= 0 && tl.render(_bigNum$1, true, true);
}, _updatePropTweens = function _updatePropTweens2(tween, property, value, start2, startIsRelative, ratio, time, skipRecursion) {
  var ptCache = (tween._pt && tween._ptCache || (tween._ptCache = {}))[property], pt, rootPT, lookup, i;
  if (!ptCache) {
    ptCache = tween._ptCache[property] = [];
    lookup = tween._ptLookup;
    i = tween._targets.length;
    while (i--) {
      pt = lookup[i][property];
      if (pt && pt.d && pt.d._pt) {
        pt = pt.d._pt;
        while (pt && pt.p !== property && pt.fp !== property) {
          pt = pt._next;
        }
      }
      if (!pt) {
        _forceAllPropTweens = 1;
        tween.vars[property] = "+=0";
        _initTween(tween, time);
        _forceAllPropTweens = 0;
        return skipRecursion ? _warn(property + " not eligible for reset") : 1;
      }
      ptCache.push(pt);
    }
  }
  i = ptCache.length;
  while (i--) {
    rootPT = ptCache[i];
    pt = rootPT._pt || rootPT;
    pt.s = (start2 || start2 === 0) && !startIsRelative ? start2 : pt.s + (start2 || 0) + ratio * pt.c;
    pt.c = value - pt.s;
    rootPT.e && (rootPT.e = _round(value) + getUnit(rootPT.e));
    rootPT.b && (rootPT.b = pt.s + getUnit(rootPT.b));
  }
}, _addAliasesToVars = function _addAliasesToVars2(targets, vars) {
  var harness = targets[0] ? _getCache(targets[0]).harness : 0, propertyAliases = harness && harness.aliases, copy, p, i, aliases;
  if (!propertyAliases) {
    return vars;
  }
  copy = _merge({}, vars);
  for (p in propertyAliases) {
    if (p in copy) {
      aliases = propertyAliases[p].split(",");
      i = aliases.length;
      while (i--) {
        copy[aliases[i]] = copy[p];
      }
    }
  }
  return copy;
}, _parseKeyframe = function _parseKeyframe2(prop, obj, allProps, easeEach) {
  var ease = obj.ease || easeEach || "power1.inOut", p, a;
  if (_isArray(obj)) {
    a = allProps[prop] || (allProps[prop] = []);
    obj.forEach(function(value, i) {
      return a.push({
        t: i / (obj.length - 1) * 100,
        v: value,
        e: ease
      });
    });
  } else {
    for (p in obj) {
      a = allProps[p] || (allProps[p] = []);
      p === "ease" || a.push({
        t: parseFloat(prop),
        v: obj[p],
        e: ease
      });
    }
  }
}, _parseFuncOrString = function _parseFuncOrString2(value, tween, i, target, targets) {
  return _isFunction(value) ? value.call(tween, i, target, targets) : _isString(value) && ~value.indexOf("random(") ? _replaceRandom(value) : value;
}, _staggerTweenProps = _callbackNames + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert", _staggerPropsToSkip = {};
_forEachName(_staggerTweenProps + ",id,stagger,delay,duration,paused,scrollTrigger", function(name) {
  return _staggerPropsToSkip[name] = 1;
});
var Tween = /* @__PURE__ */ (function(_Animation2) {
  _inheritsLoose(Tween2, _Animation2);
  function Tween2(targets, vars, position, skipInherit) {
    var _this3;
    if (typeof vars === "number") {
      position.duration = vars;
      vars = position;
      position = null;
    }
    _this3 = _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars)) || this;
    var _this3$vars = _this3.vars, duration = _this3$vars.duration, delay = _this3$vars.delay, immediateRender = _this3$vars.immediateRender, stagger = _this3$vars.stagger, overwrite = _this3$vars.overwrite, keyframes = _this3$vars.keyframes, defaults22 = _this3$vars.defaults, scrollTrigger = _this3$vars.scrollTrigger, yoyoEase = _this3$vars.yoyoEase, parent = vars.parent || _globalTimeline, parsedTargets = (_isArray(targets) || _isTypedArray(targets) ? _isNumber(targets[0]) : "length" in vars) ? [targets] : toArray$1(targets), tl, i, copy, l, p, curTarget, staggerFunc, staggerVarsToMerge;
    _this3._targets = parsedTargets.length ? _harness(parsedTargets) : _warn("GSAP target " + targets + " not found. https://gsap.com", !_config.nullTargetWarn) || [];
    _this3._ptLookup = [];
    _this3._overwrite = overwrite;
    if (keyframes || stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
      vars = _this3.vars;
      tl = _this3.timeline = new Timeline({
        data: "nested",
        defaults: defaults22 || {},
        targets: parent && parent.data === "nested" ? parent.vars.targets : parsedTargets
      });
      tl.kill();
      tl.parent = tl._dp = _assertThisInitialized(_this3);
      tl._start = 0;
      if (stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
        l = parsedTargets.length;
        staggerFunc = stagger && distribute(stagger);
        if (_isObject(stagger)) {
          for (p in stagger) {
            if (~_staggerTweenProps.indexOf(p)) {
              staggerVarsToMerge || (staggerVarsToMerge = {});
              staggerVarsToMerge[p] = stagger[p];
            }
          }
        }
        for (i = 0; i < l; i++) {
          copy = _copyExcluding(vars, _staggerPropsToSkip);
          copy.stagger = 0;
          yoyoEase && (copy.yoyoEase = yoyoEase);
          staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
          curTarget = parsedTargets[i];
          copy.duration = +_parseFuncOrString(duration, _assertThisInitialized(_this3), i, curTarget, parsedTargets);
          copy.delay = (+_parseFuncOrString(delay, _assertThisInitialized(_this3), i, curTarget, parsedTargets) || 0) - _this3._delay;
          if (!stagger && l === 1 && copy.delay) {
            _this3._delay = delay = copy.delay;
            _this3._start += delay;
            copy.delay = 0;
          }
          tl.to(curTarget, copy, staggerFunc ? staggerFunc(i, curTarget, parsedTargets) : 0);
          tl._ease = _easeMap.none;
        }
        tl.duration() ? duration = delay = 0 : _this3.timeline = 0;
      } else if (keyframes) {
        _inheritDefaults(_setDefaults(tl.vars.defaults, {
          ease: "none"
        }));
        tl._ease = _parseEase(keyframes.ease || vars.ease || "none");
        var time = 0, a, kf, v;
        if (_isArray(keyframes)) {
          keyframes.forEach(function(frame) {
            return tl.to(parsedTargets, frame, ">");
          });
          tl.duration();
        } else {
          copy = {};
          for (p in keyframes) {
            p === "ease" || p === "easeEach" || _parseKeyframe(p, keyframes[p], copy, keyframes.easeEach);
          }
          for (p in copy) {
            a = copy[p].sort(function(a2, b) {
              return a2.t - b.t;
            });
            time = 0;
            for (i = 0; i < a.length; i++) {
              kf = a[i];
              v = {
                ease: kf.e,
                duration: (kf.t - (i ? a[i - 1].t : 0)) / 100 * duration
              };
              v[p] = kf.v;
              tl.to(parsedTargets, v, time);
              time += v.duration;
            }
          }
          tl.duration() < duration && tl.to({}, {
            duration: duration - tl.duration()
          });
        }
      }
      duration || _this3.duration(duration = tl.duration());
    } else {
      _this3.timeline = 0;
    }
    if (overwrite === true && !_suppressOverwrites) {
      _overwritingTween = _assertThisInitialized(_this3);
      _globalTimeline.killTweensOf(parsedTargets);
      _overwritingTween = 0;
    }
    _addToTimeline(parent, _assertThisInitialized(_this3), position);
    vars.reversed && _this3.reverse();
    vars.paused && _this3.paused(true);
    if (immediateRender || !duration && !keyframes && _this3._start === _roundPrecise(parent._time) && _isNotFalse(immediateRender) && _hasNoPausedAncestors(_assertThisInitialized(_this3)) && parent.data !== "nested") {
      _this3._tTime = -_tinyNum;
      _this3.render(Math.max(0, -delay) || 0);
    }
    scrollTrigger && _scrollTrigger(_assertThisInitialized(_this3), scrollTrigger);
    return _this3;
  }
  var _proto3 = Tween2.prototype;
  _proto3.render = function render22(totalTime, suppressEvents, force) {
    var prevTime = this._time, tDur = this._tDur, dur = this._dur, isNegative = totalTime < 0, tTime = totalTime > tDur - _tinyNum && !isNegative ? tDur : totalTime < _tinyNum ? 0 : totalTime, time, pt, iteration, cycleDuration, prevIteration, isYoyo, ratio, timeline2, yoyoEase;
    if (!dur) {
      _renderZeroDurationTween(this, totalTime, suppressEvents, force);
    } else if (tTime !== this._tTime || !totalTime || force || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== isNegative || this._lazy) {
      time = tTime;
      timeline2 = this.timeline;
      if (this._repeat) {
        cycleDuration = dur + this._rDelay;
        if (this._repeat < -1 && isNegative) {
          return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
        }
        time = _roundPrecise(tTime % cycleDuration);
        if (tTime === tDur) {
          iteration = this._repeat;
          time = dur;
        } else {
          prevIteration = _roundPrecise(tTime / cycleDuration);
          iteration = ~~prevIteration;
          if (iteration && iteration === prevIteration) {
            time = dur;
            iteration--;
          } else if (time > dur) {
            time = dur;
          }
        }
        isYoyo = this._yoyo && iteration & 1;
        if (isYoyo) {
          yoyoEase = this._yEase;
          time = dur - time;
        }
        prevIteration = _animationCycle(this._tTime, cycleDuration);
        if (time === prevTime && !force && this._initted && iteration === prevIteration) {
          this._tTime = tTime;
          return this;
        }
        if (iteration !== prevIteration) {
          timeline2 && this._yEase && _propagateYoyoEase(timeline2, isYoyo);
          if (this.vars.repeatRefresh && !isYoyo && !this._lock && time !== cycleDuration && this._initted) {
            this._lock = force = 1;
            this.render(_roundPrecise(cycleDuration * iteration), true).invalidate()._lock = 0;
          }
        }
      }
      if (!this._initted) {
        if (_attemptInitTween(this, isNegative ? totalTime : time, force, suppressEvents, tTime)) {
          this._tTime = 0;
          return this;
        }
        if (prevTime !== this._time && !(force && this.vars.repeatRefresh && iteration !== prevIteration)) {
          return this;
        }
        if (dur !== this._dur) {
          return this.render(totalTime, suppressEvents, force);
        }
      }
      this._tTime = tTime;
      this._time = time;
      if (!this._act && this._ts) {
        this._act = 1;
        this._lazy = 0;
      }
      this.ratio = ratio = (yoyoEase || this._ease)(time / dur);
      if (this._from) {
        this.ratio = ratio = 1 - ratio;
      }
      if (!prevTime && tTime && !suppressEvents && !prevIteration) {
        _callback(this, "onStart");
        if (this._tTime !== tTime) {
          return this;
        }
      }
      pt = this._pt;
      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }
      timeline2 && timeline2.render(totalTime < 0 ? totalTime : timeline2._dur * timeline2._ease(time / this._dur), suppressEvents, force) || this._startAt && (this._zTime = totalTime);
      if (this._onUpdate && !suppressEvents) {
        isNegative && _rewindStartAt(this, totalTime, suppressEvents, force);
        _callback(this, "onUpdate");
      }
      this._repeat && iteration !== prevIteration && this.vars.onRepeat && !suppressEvents && this.parent && _callback(this, "onRepeat");
      if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
        isNegative && !this._onUpdate && _rewindStartAt(this, totalTime, true, true);
        (totalTime || !dur) && (tTime === this._tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1);
        if (!suppressEvents && !(isNegative && !prevTime) && (tTime || prevTime || isYoyo)) {
          _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);
          this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
        }
      }
    }
    return this;
  };
  _proto3.targets = function targets() {
    return this._targets;
  };
  _proto3.invalidate = function invalidate(soft) {
    (!soft || !this.vars.runBackwards) && (this._startAt = 0);
    this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0;
    this._ptLookup = [];
    this.timeline && this.timeline.invalidate(soft);
    return _Animation2.prototype.invalidate.call(this, soft);
  };
  _proto3.resetTo = function resetTo(property, value, start2, startIsRelative, skipRecursion) {
    _tickerActive || _ticker.wake();
    this._ts || this.play();
    var time = Math.min(this._dur, (this._dp._time - this._start) * this._ts), ratio;
    this._initted || _initTween(this, time);
    ratio = this._ease(time / this._dur);
    if (_updatePropTweens(this, property, value, start2, startIsRelative, ratio, time, skipRecursion)) {
      return this.resetTo(property, value, start2, startIsRelative, 1);
    }
    _alignPlayhead(this, 0);
    this.parent || _addLinkedListItem(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0);
    return this.render(0);
  };
  _proto3.kill = function kill(targets, vars) {
    if (vars === void 0) {
      vars = "all";
    }
    if (!targets && (!vars || vars === "all")) {
      this._lazy = this._pt = 0;
      this.parent ? _interrupt(this) : this.scrollTrigger && this.scrollTrigger.kill(!!_reverting$1);
      return this;
    }
    if (this.timeline) {
      var tDur = this.timeline.totalDuration();
      this.timeline.killTweensOf(targets, vars, _overwritingTween && _overwritingTween.vars.overwrite !== true)._first || _interrupt(this);
      this.parent && tDur !== this.timeline.totalDuration() && _setDuration(this, this._dur * this.timeline._tDur / tDur, 0, 1);
      return this;
    }
    var parsedTargets = this._targets, killingTargets = targets ? toArray$1(targets) : parsedTargets, propTweenLookup = this._ptLookup, firstPT = this._pt, overwrittenProps, curLookup, curOverwriteProps, props, p, pt, i;
    if ((!vars || vars === "all") && _arraysMatch(parsedTargets, killingTargets)) {
      vars === "all" && (this._pt = 0);
      return _interrupt(this);
    }
    overwrittenProps = this._op = this._op || [];
    if (vars !== "all") {
      if (_isString(vars)) {
        p = {};
        _forEachName(vars, function(name) {
          return p[name] = 1;
        });
        vars = p;
      }
      vars = _addAliasesToVars(parsedTargets, vars);
    }
    i = parsedTargets.length;
    while (i--) {
      if (~killingTargets.indexOf(parsedTargets[i])) {
        curLookup = propTweenLookup[i];
        if (vars === "all") {
          overwrittenProps[i] = vars;
          props = curLookup;
          curOverwriteProps = {};
        } else {
          curOverwriteProps = overwrittenProps[i] = overwrittenProps[i] || {};
          props = vars;
        }
        for (p in props) {
          pt = curLookup && curLookup[p];
          if (pt) {
            if (!("kill" in pt.d) || pt.d.kill(p) === true) {
              _removeLinkedListItem(this, pt, "_pt");
            }
            delete curLookup[p];
          }
          if (curOverwriteProps !== "all") {
            curOverwriteProps[p] = 1;
          }
        }
      }
    }
    this._initted && !this._pt && firstPT && _interrupt(this);
    return this;
  };
  Tween2.to = function to(targets, vars) {
    return new Tween2(targets, vars, arguments[2]);
  };
  Tween2.from = function from(targets, vars) {
    return _createTweenType(1, arguments);
  };
  Tween2.delayedCall = function delayedCall(delay, callback, params, scope) {
    return new Tween2(callback, 0, {
      immediateRender: false,
      lazy: false,
      overwrite: false,
      delay,
      onComplete: callback,
      onReverseComplete: callback,
      onCompleteParams: params,
      onReverseCompleteParams: params,
      callbackScope: scope
    });
  };
  Tween2.fromTo = function fromTo(targets, fromVars, toVars) {
    return _createTweenType(2, arguments);
  };
  Tween2.set = function set2(targets, vars) {
    vars.duration = 0;
    vars.repeatDelay || (vars.repeat = 0);
    return new Tween2(targets, vars);
  };
  Tween2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
    return _globalTimeline.killTweensOf(targets, props, onlyActive);
  };
  return Tween2;
})(Animation);
_setDefaults(Tween.prototype, {
  _targets: [],
  _lazy: 0,
  _startAt: 0,
  _op: 0,
  _onInit: 0
});
_forEachName("staggerTo,staggerFrom,staggerFromTo", function(name) {
  Tween[name] = function() {
    var tl = new Timeline(), params = _slice.call(arguments, 0);
    params.splice(name === "staggerFromTo" ? 5 : 4, 0, 0);
    return tl[name].apply(tl, params);
  };
});
var _setterPlain = function _setterPlain2(target, property, value) {
  return target[property] = value;
}, _setterFunc = function _setterFunc2(target, property, value) {
  return target[property](value);
}, _setterFuncWithParam = function _setterFuncWithParam2(target, property, value, data) {
  return target[property](data.fp, value);
}, _setterAttribute = function _setterAttribute2(target, property, value) {
  return target.setAttribute(property, value);
}, _getSetter = function _getSetter2(target, property) {
  return _isFunction(target[property]) ? _setterFunc : _isUndefined(target[property]) && target.setAttribute ? _setterAttribute : _setterPlain;
}, _renderPlain = function _renderPlain2(ratio, data) {
  return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1e6) / 1e6, data);
}, _renderBoolean = function _renderBoolean2(ratio, data) {
  return data.set(data.t, data.p, !!(data.s + data.c * ratio), data);
}, _renderComplexString = function _renderComplexString2(ratio, data) {
  var pt = data._pt, s = "";
  if (!ratio && data.b) {
    s = data.b;
  } else if (ratio === 1 && data.e) {
    s = data.e;
  } else {
    while (pt) {
      s = pt.p + (pt.m ? pt.m(pt.s + pt.c * ratio) : Math.round((pt.s + pt.c * ratio) * 1e4) / 1e4) + s;
      pt = pt._next;
    }
    s += data.c;
  }
  data.set(data.t, data.p, s, data);
}, _renderPropTweens = function _renderPropTweens2(ratio, data) {
  var pt = data._pt;
  while (pt) {
    pt.r(ratio, pt.d);
    pt = pt._next;
  }
}, _addPluginModifier = function _addPluginModifier2(modifier, tween, target, property) {
  var pt = this._pt, next;
  while (pt) {
    next = pt._next;
    pt.p === property && pt.modifier(modifier, tween, target);
    pt = next;
  }
}, _killPropTweensOf = function _killPropTweensOf2(property) {
  var pt = this._pt, hasNonDependentRemaining, next;
  while (pt) {
    next = pt._next;
    if (pt.p === property && !pt.op || pt.op === property) {
      _removeLinkedListItem(this, pt, "_pt");
    } else if (!pt.dep) {
      hasNonDependentRemaining = 1;
    }
    pt = next;
  }
  return !hasNonDependentRemaining;
}, _setterWithModifier = function _setterWithModifier2(target, property, value, data) {
  data.mSet(target, property, data.m.call(data.tween, value, data.mt), data);
}, _sortPropTweensByPriority = function _sortPropTweensByPriority2(parent) {
  var pt = parent._pt, next, pt2, first, last;
  while (pt) {
    next = pt._next;
    pt2 = first;
    while (pt2 && pt2.pr > pt.pr) {
      pt2 = pt2._next;
    }
    if (pt._prev = pt2 ? pt2._prev : last) {
      pt._prev._next = pt;
    } else {
      first = pt;
    }
    if (pt._next = pt2) {
      pt2._prev = pt;
    } else {
      last = pt;
    }
    pt = next;
  }
  parent._pt = first;
};
var PropTween = /* @__PURE__ */ (function() {
  function PropTween2(next, target, prop, start2, change, renderer, data, setter, priority) {
    this.t = target;
    this.s = start2;
    this.c = change;
    this.p = prop;
    this.r = renderer || _renderPlain;
    this.d = data || this;
    this.set = setter || _setterPlain;
    this.pr = priority || 0;
    this._next = next;
    if (next) {
      next._prev = this;
    }
  }
  var _proto4 = PropTween2.prototype;
  _proto4.modifier = function modifier(func, tween, target) {
    this.mSet = this.mSet || this.set;
    this.set = _setterWithModifier;
    this.m = func;
    this.mt = target;
    this.tween = tween;
  };
  return PropTween2;
})();
_forEachName(_callbackNames + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function(name) {
  return _reservedProps[name] = 1;
});
_globals.TweenMax = _globals.TweenLite = Tween;
_globals.TimelineLite = _globals.TimelineMax = Timeline;
_globalTimeline = new Timeline({
  sortChildren: false,
  defaults: _defaults$1,
  autoRemoveChildren: true,
  id: "root",
  smoothChildTiming: true
});
_config.stringFilter = _colorStringFilter;
var _media = [], _listeners = {}, _emptyArray = [], _lastMediaTime = 0, _contextID = 0, _dispatch = function _dispatch2(type) {
  return (_listeners[type] || _emptyArray).map(function(f) {
    return f();
  });
}, _onMediaChange = function _onMediaChange2() {
  var time = Date.now(), matches = [];
  if (time - _lastMediaTime > 2) {
    _dispatch("matchMediaInit");
    _media.forEach(function(c) {
      var queries = c.queries, conditions = c.conditions, match, p, anyMatch, toggled;
      for (p in queries) {
        match = _win$1.matchMedia(queries[p]).matches;
        match && (anyMatch = 1);
        if (match !== conditions[p]) {
          conditions[p] = match;
          toggled = 1;
        }
      }
      if (toggled) {
        c.revert();
        anyMatch && matches.push(c);
      }
    });
    _dispatch("matchMediaRevert");
    matches.forEach(function(c) {
      return c.onMatch(c, function(func) {
        return c.add(null, func);
      });
    });
    _lastMediaTime = time;
    _dispatch("matchMedia");
  }
};
var Context = /* @__PURE__ */ (function() {
  function Context2(func, scope) {
    this.selector = scope && selector(scope);
    this.data = [];
    this._r = [];
    this.isReverted = false;
    this.id = _contextID++;
    func && this.add(func);
  }
  var _proto5 = Context2.prototype;
  _proto5.add = function add(name, func, scope) {
    if (_isFunction(name)) {
      scope = func;
      func = name;
      name = _isFunction;
    }
    var self = this, f = function f2() {
      var prev = _context, prevSelector = self.selector, result;
      prev && prev !== self && prev.data.push(self);
      scope && (self.selector = selector(scope));
      _context = self;
      result = func.apply(self, arguments);
      _isFunction(result) && self._r.push(result);
      _context = prev;
      self.selector = prevSelector;
      self.isReverted = false;
      return result;
    };
    self.last = f;
    return name === _isFunction ? f(self, function(func2) {
      return self.add(null, func2);
    }) : name ? self[name] = f : f;
  };
  _proto5.ignore = function ignore(func) {
    var prev = _context;
    _context = null;
    func(this);
    _context = prev;
  };
  _proto5.getTweens = function getTweens() {
    var a = [];
    this.data.forEach(function(e) {
      return e instanceof Context2 ? a.push.apply(a, e.getTweens()) : e instanceof Tween && !(e.parent && e.parent.data === "nested") && a.push(e);
    });
    return a;
  };
  _proto5.clear = function clear2() {
    this._r.length = this.data.length = 0;
  };
  _proto5.kill = function kill(revert, matchMedia2) {
    var _this4 = this;
    if (revert) {
      (function() {
        var tweens = _this4.getTweens(), i2 = _this4.data.length, t;
        while (i2--) {
          t = _this4.data[i2];
          if (t.data === "isFlip") {
            t.revert();
            t.getChildren(true, true, false).forEach(function(tween) {
              return tweens.splice(tweens.indexOf(tween), 1);
            });
          }
        }
        tweens.map(function(t2) {
          return {
            g: t2._dur || t2._delay || t2._sat && !t2._sat.vars.immediateRender ? t2.globalTime(0) : -Infinity,
            t: t2
          };
        }).sort(function(a, b) {
          return b.g - a.g || -Infinity;
        }).forEach(function(o) {
          return o.t.revert(revert);
        });
        i2 = _this4.data.length;
        while (i2--) {
          t = _this4.data[i2];
          if (t instanceof Timeline) {
            if (t.data !== "nested") {
              t.scrollTrigger && t.scrollTrigger.revert();
              t.kill();
            }
          } else {
            !(t instanceof Tween) && t.revert && t.revert(revert);
          }
        }
        _this4._r.forEach(function(f) {
          return f(revert, _this4);
        });
        _this4.isReverted = true;
      })();
    } else {
      this.data.forEach(function(e) {
        return e.kill && e.kill();
      });
    }
    this.clear();
    if (matchMedia2) {
      var i = _media.length;
      while (i--) {
        _media[i].id === this.id && _media.splice(i, 1);
      }
    }
  };
  _proto5.revert = function revert(config3) {
    this.kill(config3 || {});
  };
  return Context2;
})();
var MatchMedia = /* @__PURE__ */ (function() {
  function MatchMedia2(scope) {
    this.contexts = [];
    this.scope = scope;
    _context && _context.data.push(this);
  }
  var _proto6 = MatchMedia2.prototype;
  _proto6.add = function add(conditions, func, scope) {
    _isObject(conditions) || (conditions = {
      matches: conditions
    });
    var context3 = new Context(0, scope || this.scope), cond = context3.conditions = {}, mq, p, active;
    _context && !context3.selector && (context3.selector = _context.selector);
    this.contexts.push(context3);
    func = context3.add("onMatch", func);
    context3.queries = conditions;
    for (p in conditions) {
      if (p === "all") {
        active = 1;
      } else {
        mq = _win$1.matchMedia(conditions[p]);
        if (mq) {
          _media.indexOf(context3) < 0 && _media.push(context3);
          (cond[p] = mq.matches) && (active = 1);
          mq.addListener ? mq.addListener(_onMediaChange) : mq.addEventListener("change", _onMediaChange);
        }
      }
    }
    active && func(context3, function(f) {
      return context3.add(null, f);
    });
    return this;
  };
  _proto6.revert = function revert(config3) {
    this.kill(config3 || {});
  };
  _proto6.kill = function kill(revert) {
    this.contexts.forEach(function(c) {
      return c.kill(revert, true);
    });
  };
  return MatchMedia2;
})();
var _gsap = {
  registerPlugin: function registerPlugin() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    args.forEach(function(config3) {
      return _createPlugin(config3);
    });
  },
  timeline: function timeline(vars) {
    return new Timeline(vars);
  },
  getTweensOf: function getTweensOf(targets, onlyActive) {
    return _globalTimeline.getTweensOf(targets, onlyActive);
  },
  getProperty: function getProperty(target, property, unit, uncache) {
    _isString(target) && (target = toArray$1(target)[0]);
    var getter = _getCache(target || {}).get, format = unit ? _passThrough : _numericIfPossible;
    unit === "native" && (unit = "");
    return !target ? target : !property ? function(property2, unit2, uncache2) {
      return format((_plugins[property2] && _plugins[property2].get || getter)(target, property2, unit2, uncache2));
    } : format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
  },
  quickSetter: function quickSetter(target, property, unit) {
    target = toArray$1(target);
    if (target.length > 1) {
      var setters = target.map(function(t) {
        return gsap.quickSetter(t, property, unit);
      }), l = setters.length;
      return function(value) {
        var i = l;
        while (i--) {
          setters[i](value);
        }
      };
    }
    target = target[0] || {};
    var Plugin = _plugins[property], cache2 = _getCache(target), p = cache2.harness && (cache2.harness.aliases || {})[property] || property, setter = Plugin ? function(value) {
      var p2 = new Plugin();
      _quickTween._pt = 0;
      p2.init(target, unit ? value + unit : value, _quickTween, 0, [target]);
      p2.render(1, p2);
      _quickTween._pt && _renderPropTweens(1, _quickTween);
    } : cache2.set(target, p);
    return Plugin ? setter : function(value) {
      return setter(target, p, unit ? value + unit : value, cache2, 1);
    };
  },
  quickTo: function quickTo(target, property, vars) {
    var _setDefaults22;
    var tween = gsap.to(target, _setDefaults((_setDefaults22 = {}, _setDefaults22[property] = "+=0.1", _setDefaults22.paused = true, _setDefaults22.stagger = 0, _setDefaults22), vars || {})), func = function func2(value, start2, startIsRelative) {
      return tween.resetTo(property, value, start2, startIsRelative);
    };
    func.tween = tween;
    return func;
  },
  isTweening: function isTweening(targets) {
    return _globalTimeline.getTweensOf(targets, true).length > 0;
  },
  defaults: function defaults(value) {
    value && value.ease && (value.ease = _parseEase(value.ease, _defaults$1.ease));
    return _mergeDeep(_defaults$1, value || {});
  },
  config: function config2(value) {
    return _mergeDeep(_config, value || {});
  },
  registerEffect: function registerEffect(_ref3) {
    var name = _ref3.name, effect3 = _ref3.effect, plugins = _ref3.plugins, defaults22 = _ref3.defaults, extendTimeline = _ref3.extendTimeline;
    (plugins || "").split(",").forEach(function(pluginName) {
      return pluginName && !_plugins[pluginName] && !_globals[pluginName] && _warn(name + " effect requires " + pluginName + " plugin.");
    });
    _effects[name] = function(targets, vars, tl) {
      return effect3(toArray$1(targets), _setDefaults(vars || {}, defaults22), tl);
    };
    if (extendTimeline) {
      Timeline.prototype[name] = function(targets, vars, position) {
        return this.add(_effects[name](targets, _isObject(vars) ? vars : (position = vars) && {}, this), position);
      };
    }
  },
  registerEase: function registerEase(name, ease) {
    _easeMap[name] = _parseEase(ease);
  },
  parseEase: function parseEase(ease, defaultEase) {
    return arguments.length ? _parseEase(ease, defaultEase) : _easeMap;
  },
  getById: function getById(id) {
    return _globalTimeline.getById(id);
  },
  exportRoot: function exportRoot(vars, includeDelayedCalls) {
    if (vars === void 0) {
      vars = {};
    }
    var tl = new Timeline(vars), child, next;
    tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);
    _globalTimeline.remove(tl);
    tl._dp = 0;
    tl._time = tl._tTime = _globalTimeline._time;
    child = _globalTimeline._first;
    while (child) {
      next = child._next;
      if (includeDelayedCalls || !(!child._dur && child instanceof Tween && child.vars.onComplete === child._targets[0])) {
        _addToTimeline(tl, child, child._start - child._delay);
      }
      child = next;
    }
    _addToTimeline(_globalTimeline, tl, 0);
    return tl;
  },
  context: function context(func, scope) {
    return func ? new Context(func, scope) : _context;
  },
  matchMedia: function matchMedia(scope) {
    return new MatchMedia(scope);
  },
  matchMediaRefresh: function matchMediaRefresh() {
    return _media.forEach(function(c) {
      var cond = c.conditions, found, p;
      for (p in cond) {
        if (cond[p]) {
          cond[p] = false;
          found = 1;
        }
      }
      found && c.revert();
    }) || _onMediaChange();
  },
  addEventListener: function addEventListener(type, callback) {
    var a = _listeners[type] || (_listeners[type] = []);
    ~a.indexOf(callback) || a.push(callback);
  },
  removeEventListener: function removeEventListener(type, callback) {
    var a = _listeners[type], i = a && a.indexOf(callback);
    i >= 0 && a.splice(i, 1);
  },
  utils: {
    wrap,
    wrapYoyo,
    distribute,
    random,
    snap,
    normalize,
    getUnit,
    clamp,
    splitColor,
    toArray: toArray$1,
    selector,
    mapRange,
    pipe,
    unitize,
    interpolate,
    shuffle
  },
  install: _install,
  effects: _effects,
  ticker: _ticker,
  updateRoot: Timeline.updateRoot,
  plugins: _plugins,
  globalTimeline: _globalTimeline,
  core: {
    PropTween,
    globals: _addGlobal,
    Tween,
    Timeline,
    Animation,
    getCache: _getCache,
    _removeLinkedListItem,
    reverting: function reverting() {
      return _reverting$1;
    },
    context: function context2(toAdd) {
      if (toAdd && _context) {
        _context.data.push(toAdd);
        toAdd._ctx = _context;
      }
      return _context;
    },
    suppressOverwrites: function suppressOverwrites(value) {
      return _suppressOverwrites = value;
    }
  }
};
_forEachName("to,from,fromTo,delayedCall,set,killTweensOf", function(name) {
  return _gsap[name] = Tween[name];
});
_ticker.add(Timeline.updateRoot);
_quickTween = _gsap.to({}, {
  duration: 0
});
var _getPluginPropTween = function _getPluginPropTween2(plugin, prop) {
  var pt = plugin._pt;
  while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) {
    pt = pt._next;
  }
  return pt;
}, _addModifiers = function _addModifiers2(tween, modifiers) {
  var targets = tween._targets, p, i, pt;
  for (p in modifiers) {
    i = targets.length;
    while (i--) {
      pt = tween._ptLookup[i][p];
      if (pt && (pt = pt.d)) {
        if (pt._pt) {
          pt = _getPluginPropTween(pt, p);
        }
        pt && pt.modifier && pt.modifier(modifiers[p], tween, targets[i], p);
      }
    }
  }
}, _buildModifierPlugin = function _buildModifierPlugin2(name, modifier) {
  return {
    name,
    headless: 1,
    rawVars: 1,
    //don't pre-process function-based values or "random()" strings.
    init: function init32(target, vars, tween) {
      tween._onInit = function(tween2) {
        var temp, p;
        if (_isString(vars)) {
          temp = {};
          _forEachName(vars, function(name2) {
            return temp[name2] = 1;
          });
          vars = temp;
        }
        if (modifier) {
          temp = {};
          for (p in vars) {
            temp[p] = modifier(vars[p]);
          }
          vars = temp;
        }
        _addModifiers(tween2, vars);
      };
    }
  };
};
var gsap = _gsap.registerPlugin({
  name: "attr",
  init: function init2(target, vars, tween, index, targets) {
    var p, pt, v;
    this.tween = tween;
    for (p in vars) {
      v = target.getAttribute(p) || "";
      pt = this.add(target, "setAttribute", (v || 0) + "", vars[p], index, targets, 0, 0, p);
      pt.op = p;
      pt.b = v;
      this._props.push(p);
    }
  },
  render: function render2(ratio, data) {
    var pt = data._pt;
    while (pt) {
      _reverting$1 ? pt.set(pt.t, pt.p, pt.b, pt) : pt.r(ratio, pt.d);
      pt = pt._next;
    }
  }
}, {
  name: "endArray",
  headless: 1,
  init: function init22(target, value) {
    var i = value.length;
    while (i--) {
      this.add(target, i, target[i] || 0, value[i], 0, 0, 0, 0, 0, 1);
    }
  }
}, _buildModifierPlugin("roundProps", _roundModifier), _buildModifierPlugin("modifiers"), _buildModifierPlugin("snap", snap)) || _gsap;
Tween.version = Timeline.version = gsap.version = "3.13.0";
_coreReady = 1;
_windowExists$1() && _wake();
_easeMap.Power0;
_easeMap.Power1;
_easeMap.Power2;
_easeMap.Power3;
_easeMap.Power4;
_easeMap.Linear;
_easeMap.Quad;
_easeMap.Cubic;
_easeMap.Quart;
_easeMap.Quint;
_easeMap.Strong;
_easeMap.Elastic;
_easeMap.Back;
_easeMap.SteppedEase;
_easeMap.Bounce;
_easeMap.Sine;
_easeMap.Expo;
_easeMap.Circ;
/*!
 * CSSPlugin 3.13.0
 * https://gsap.com
 *
 * Copyright 2008-2025, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/
var _win, _doc, _docElement, _pluginInitted, _tempDiv, _recentSetterPlugin, _reverting, _windowExists = function _windowExists22() {
  return typeof window !== "undefined";
}, _transformProps = {}, _RAD2DEG = 180 / Math.PI, _DEG2RAD = Math.PI / 180, _atan2 = Math.atan2, _bigNum = 1e8, _capsExp = /([A-Z])/g, _horizontalExp = /(left|right|width|margin|padding|x)/i, _complexExp = /[\s,\(]\S/, _propertyAliases = {
  autoAlpha: "opacity,visibility",
  scale: "scaleX,scaleY",
  alpha: "opacity"
}, _renderCSSProp = function _renderCSSProp2(ratio, data) {
  return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u, data);
}, _renderPropWithEnd = function _renderPropWithEnd2(ratio, data) {
  return data.set(data.t, data.p, ratio === 1 ? data.e : Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u, data);
}, _renderCSSPropWithBeginning = function _renderCSSPropWithBeginning2(ratio, data) {
  return data.set(data.t, data.p, ratio ? Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u : data.b, data);
}, _renderRoundedCSSProp = function _renderRoundedCSSProp2(ratio, data) {
  var value = data.s + data.c * ratio;
  data.set(data.t, data.p, ~~(value + (value < 0 ? -0.5 : 0.5)) + data.u, data);
}, _renderNonTweeningValue = function _renderNonTweeningValue2(ratio, data) {
  return data.set(data.t, data.p, ratio ? data.e : data.b, data);
}, _renderNonTweeningValueOnlyAtEnd = function _renderNonTweeningValueOnlyAtEnd2(ratio, data) {
  return data.set(data.t, data.p, ratio !== 1 ? data.b : data.e, data);
}, _setterCSSStyle = function _setterCSSStyle2(target, property, value) {
  return target.style[property] = value;
}, _setterCSSProp = function _setterCSSProp2(target, property, value) {
  return target.style.setProperty(property, value);
}, _setterTransform = function _setterTransform2(target, property, value) {
  return target._gsap[property] = value;
}, _setterScale = function _setterScale2(target, property, value) {
  return target._gsap.scaleX = target._gsap.scaleY = value;
}, _setterScaleWithRender = function _setterScaleWithRender2(target, property, value, data, ratio) {
  var cache2 = target._gsap;
  cache2.scaleX = cache2.scaleY = value;
  cache2.renderTransform(ratio, cache2);
}, _setterTransformWithRender = function _setterTransformWithRender2(target, property, value, data, ratio) {
  var cache2 = target._gsap;
  cache2[property] = value;
  cache2.renderTransform(ratio, cache2);
}, _transformProp = "transform", _transformOriginProp = _transformProp + "Origin", _saveStyle = function _saveStyle2(property, isNotCSS) {
  var _this = this;
  var target = this.target, style = target.style, cache2 = target._gsap;
  if (property in _transformProps && style) {
    this.tfm = this.tfm || {};
    if (property !== "transform") {
      property = _propertyAliases[property] || property;
      ~property.indexOf(",") ? property.split(",").forEach(function(a) {
        return _this.tfm[a] = _get(target, a);
      }) : this.tfm[property] = cache2.x ? cache2[property] : _get(target, property);
      property === _transformOriginProp && (this.tfm.zOrigin = cache2.zOrigin);
    } else {
      return _propertyAliases.transform.split(",").forEach(function(p) {
        return _saveStyle2.call(_this, p, isNotCSS);
      });
    }
    if (this.props.indexOf(_transformProp) >= 0) {
      return;
    }
    if (cache2.svg) {
      this.svgo = target.getAttribute("data-svg-origin");
      this.props.push(_transformOriginProp, isNotCSS, "");
    }
    property = _transformProp;
  }
  (style || isNotCSS) && this.props.push(property, isNotCSS, style[property]);
}, _removeIndependentTransforms = function _removeIndependentTransforms2(style) {
  if (style.translate) {
    style.removeProperty("translate");
    style.removeProperty("scale");
    style.removeProperty("rotate");
  }
}, _revertStyle = function _revertStyle2() {
  var props = this.props, target = this.target, style = target.style, cache2 = target._gsap, i, p;
  for (i = 0; i < props.length; i += 3) {
    if (!props[i + 1]) {
      props[i + 2] ? style[props[i]] = props[i + 2] : style.removeProperty(props[i].substr(0, 2) === "--" ? props[i] : props[i].replace(_capsExp, "-$1").toLowerCase());
    } else if (props[i + 1] === 2) {
      target[props[i]](props[i + 2]);
    } else {
      target[props[i]] = props[i + 2];
    }
  }
  if (this.tfm) {
    for (p in this.tfm) {
      cache2[p] = this.tfm[p];
    }
    if (cache2.svg) {
      cache2.renderTransform();
      target.setAttribute("data-svg-origin", this.svgo || "");
    }
    i = _reverting();
    if ((!i || !i.isStart) && !style[_transformProp]) {
      _removeIndependentTransforms(style);
      if (cache2.zOrigin && style[_transformOriginProp]) {
        style[_transformOriginProp] += " " + cache2.zOrigin + "px";
        cache2.zOrigin = 0;
        cache2.renderTransform();
      }
      cache2.uncache = 1;
    }
  }
}, _getStyleSaver = function _getStyleSaver2(target, properties) {
  var saver = {
    target,
    props: [],
    revert: _revertStyle,
    save: _saveStyle
  };
  target._gsap || gsap.core.getCache(target);
  properties && target.style && target.nodeType && properties.split(",").forEach(function(p) {
    return saver.save(p);
  });
  return saver;
}, _supports3D, _createElement = function _createElement2(type, ns) {
  var e = _doc.createElementNS ? _doc.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : _doc.createElement(type);
  return e && e.style ? e : _doc.createElement(type);
}, _getComputedProperty = function _getComputedProperty2(target, property, skipPrefixFallback) {
  var cs = getComputedStyle(target);
  return cs[property] || cs.getPropertyValue(property.replace(_capsExp, "-$1").toLowerCase()) || cs.getPropertyValue(property) || !skipPrefixFallback && _getComputedProperty2(target, _checkPropPrefix(property) || property, 1) || "";
}, _prefixes = "O,Moz,ms,Ms,Webkit".split(","), _checkPropPrefix = function _checkPropPrefix2(property, element2, preferPrefix) {
  var e = element2 || _tempDiv, s = e.style, i = 5;
  if (property in s && !preferPrefix) {
    return property;
  }
  property = property.charAt(0).toUpperCase() + property.substr(1);
  while (i-- && !(_prefixes[i] + property in s)) {
  }
  return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? _prefixes[i] : "") + property;
}, _initCore = function _initCore2() {
  if (_windowExists() && window.document) {
    _win = window;
    _doc = _win.document;
    _docElement = _doc.documentElement;
    _tempDiv = _createElement("div") || {
      style: {}
    };
    _createElement("div");
    _transformProp = _checkPropPrefix(_transformProp);
    _transformOriginProp = _transformProp + "Origin";
    _tempDiv.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0";
    _supports3D = !!_checkPropPrefix("perspective");
    _reverting = gsap.core.reverting;
    _pluginInitted = 1;
  }
}, _getReparentedCloneBBox = function _getReparentedCloneBBox2(target) {
  var owner = target.ownerSVGElement, svg = _createElement("svg", owner && owner.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), clone = target.cloneNode(true), bbox;
  clone.style.display = "block";
  svg.appendChild(clone);
  _docElement.appendChild(svg);
  try {
    bbox = clone.getBBox();
  } catch (e) {
  }
  svg.removeChild(clone);
  _docElement.removeChild(svg);
  return bbox;
}, _getAttributeFallbacks = function _getAttributeFallbacks2(target, attributesArray) {
  var i = attributesArray.length;
  while (i--) {
    if (target.hasAttribute(attributesArray[i])) {
      return target.getAttribute(attributesArray[i]);
    }
  }
}, _getBBox = function _getBBox2(target) {
  var bounds, cloned;
  try {
    bounds = target.getBBox();
  } catch (error) {
    bounds = _getReparentedCloneBBox(target);
    cloned = 1;
  }
  bounds && (bounds.width || bounds.height) || cloned || (bounds = _getReparentedCloneBBox(target));
  return bounds && !bounds.width && !bounds.x && !bounds.y ? {
    x: +_getAttributeFallbacks(target, ["x", "cx", "x1"]) || 0,
    y: +_getAttributeFallbacks(target, ["y", "cy", "y1"]) || 0,
    width: 0,
    height: 0
  } : bounds;
}, _isSVG = function _isSVG2(e) {
  return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _getBBox(e));
}, _removeProperty = function _removeProperty2(target, property) {
  if (property) {
    var style = target.style, first2Chars;
    if (property in _transformProps && property !== _transformOriginProp) {
      property = _transformProp;
    }
    if (style.removeProperty) {
      first2Chars = property.substr(0, 2);
      if (first2Chars === "ms" || property.substr(0, 6) === "webkit") {
        property = "-" + property;
      }
      style.removeProperty(first2Chars === "--" ? property : property.replace(_capsExp, "-$1").toLowerCase());
    } else {
      style.removeAttribute(property);
    }
  }
}, _addNonTweeningPT = function _addNonTweeningPT2(plugin, target, property, beginning, end2, onlySetAtEnd) {
  var pt = new PropTween(plugin._pt, target, property, 0, 1, onlySetAtEnd ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue);
  plugin._pt = pt;
  pt.b = beginning;
  pt.e = end2;
  plugin._props.push(property);
  return pt;
}, _nonConvertibleUnits = {
  deg: 1,
  rad: 1,
  turn: 1
}, _nonStandardLayouts = {
  grid: 1,
  flex: 1
}, _convertToUnit = function _convertToUnit2(target, property, value, unit) {
  var curValue = parseFloat(value) || 0, curUnit = (value + "").trim().substr((curValue + "").length) || "px", style = _tempDiv.style, horizontal = _horizontalExp.test(property), isRootSVG = target.tagName.toLowerCase() === "svg", measureProperty = (isRootSVG ? "client" : "offset") + (horizontal ? "Width" : "Height"), amount = 100, toPixels = unit === "px", toPercent = unit === "%", px, parent, cache2, isSVG;
  if (unit === curUnit || !curValue || _nonConvertibleUnits[unit] || _nonConvertibleUnits[curUnit]) {
    return curValue;
  }
  curUnit !== "px" && !toPixels && (curValue = _convertToUnit2(target, property, value, "px"));
  isSVG = target.getCTM && _isSVG(target);
  if ((toPercent || curUnit === "%") && (_transformProps[property] || ~property.indexOf("adius"))) {
    px = isSVG ? target.getBBox()[horizontal ? "width" : "height"] : target[measureProperty];
    return _round(toPercent ? curValue / px * amount : curValue / 100 * px);
  }
  style[horizontal ? "width" : "height"] = amount + (toPixels ? curUnit : unit);
  parent = unit !== "rem" && ~property.indexOf("adius") || unit === "em" && target.appendChild && !isRootSVG ? target : target.parentNode;
  if (isSVG) {
    parent = (target.ownerSVGElement || {}).parentNode;
  }
  if (!parent || parent === _doc || !parent.appendChild) {
    parent = _doc.body;
  }
  cache2 = parent._gsap;
  if (cache2 && toPercent && cache2.width && horizontal && cache2.time === _ticker.time && !cache2.uncache) {
    return _round(curValue / cache2.width * amount);
  } else {
    if (toPercent && (property === "height" || property === "width")) {
      var v = target.style[property];
      target.style[property] = amount + unit;
      px = target[measureProperty];
      v ? target.style[property] = v : _removeProperty(target, property);
    } else {
      (toPercent || curUnit === "%") && !_nonStandardLayouts[_getComputedProperty(parent, "display")] && (style.position = _getComputedProperty(target, "position"));
      parent === target && (style.position = "static");
      parent.appendChild(_tempDiv);
      px = _tempDiv[measureProperty];
      parent.removeChild(_tempDiv);
      style.position = "absolute";
    }
    if (horizontal && toPercent) {
      cache2 = _getCache(parent);
      cache2.time = _ticker.time;
      cache2.width = parent[measureProperty];
    }
  }
  return _round(toPixels ? px * curValue / amount : px && curValue ? amount / px * curValue : 0);
}, _get = function _get2(target, property, unit, uncache) {
  var value;
  _pluginInitted || _initCore();
  if (property in _propertyAliases && property !== "transform") {
    property = _propertyAliases[property];
    if (~property.indexOf(",")) {
      property = property.split(",")[0];
    }
  }
  if (_transformProps[property] && property !== "transform") {
    value = _parseTransform(target, uncache);
    value = property !== "transformOrigin" ? value[property] : value.svg ? value.origin : _firstTwoOnly(_getComputedProperty(target, _transformOriginProp)) + " " + value.zOrigin + "px";
  } else {
    value = target.style[property];
    if (!value || value === "auto" || uncache || ~(value + "").indexOf("calc(")) {
      value = _specialProps[property] && _specialProps[property](target, property, unit) || _getComputedProperty(target, property) || _getProperty(target, property) || (property === "opacity" ? 1 : 0);
    }
  }
  return unit && !~(value + "").trim().indexOf(" ") ? _convertToUnit(target, property, value, unit) + unit : value;
}, _tweenComplexCSSString = function _tweenComplexCSSString2(target, prop, start2, end2) {
  if (!start2 || start2 === "none") {
    var p = _checkPropPrefix(prop, target, 1), s = p && _getComputedProperty(target, p, 1);
    if (s && s !== start2) {
      prop = p;
      start2 = s;
    } else if (prop === "borderColor") {
      start2 = _getComputedProperty(target, "borderTopColor");
    }
  }
  var pt = new PropTween(this._pt, target.style, prop, 0, 1, _renderComplexString), index = 0, matchIndex = 0, a, result, startValues, startNum, color, startValue, endValue, endNum, chunk, endUnit, startUnit, endValues;
  pt.b = start2;
  pt.e = end2;
  start2 += "";
  end2 += "";
  if (end2.substring(0, 6) === "var(--") {
    end2 = _getComputedProperty(target, end2.substring(4, end2.indexOf(")")));
  }
  if (end2 === "auto") {
    startValue = target.style[prop];
    target.style[prop] = end2;
    end2 = _getComputedProperty(target, prop) || end2;
    startValue ? target.style[prop] = startValue : _removeProperty(target, prop);
  }
  a = [start2, end2];
  _colorStringFilter(a);
  start2 = a[0];
  end2 = a[1];
  startValues = start2.match(_numWithUnitExp) || [];
  endValues = end2.match(_numWithUnitExp) || [];
  if (endValues.length) {
    while (result = _numWithUnitExp.exec(end2)) {
      endValue = result[0];
      chunk = end2.substring(index, result.index);
      if (color) {
        color = (color + 1) % 5;
      } else if (chunk.substr(-5) === "rgba(" || chunk.substr(-5) === "hsla(") {
        color = 1;
      }
      if (endValue !== (startValue = startValues[matchIndex++] || "")) {
        startNum = parseFloat(startValue) || 0;
        startUnit = startValue.substr((startNum + "").length);
        endValue.charAt(1) === "=" && (endValue = _parseRelative(startNum, endValue) + startUnit);
        endNum = parseFloat(endValue);
        endUnit = endValue.substr((endNum + "").length);
        index = _numWithUnitExp.lastIndex - endUnit.length;
        if (!endUnit) {
          endUnit = endUnit || _config.units[prop] || startUnit;
          if (index === end2.length) {
            end2 += endUnit;
            pt.e += endUnit;
          }
        }
        if (startUnit !== endUnit) {
          startNum = _convertToUnit(target, prop, startValue, endUnit) || 0;
        }
        pt._pt = {
          _next: pt._pt,
          p: chunk || matchIndex === 1 ? chunk : ",",
          //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
          s: startNum,
          c: endNum - startNum,
          m: color && color < 4 || prop === "zIndex" ? Math.round : 0
        };
      }
    }
    pt.c = index < end2.length ? end2.substring(index, end2.length) : "";
  } else {
    pt.r = prop === "display" && end2 === "none" ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue;
  }
  _relExp.test(end2) && (pt.e = 0);
  this._pt = pt;
  return pt;
}, _keywordToPercent = {
  top: "0%",
  bottom: "100%",
  left: "0%",
  right: "100%",
  center: "50%"
}, _convertKeywordsToPercentages = function _convertKeywordsToPercentages2(value) {
  var split2 = value.split(" "), x = split2[0], y = split2[1] || "50%";
  if (x === "top" || x === "bottom" || y === "left" || y === "right") {
    value = x;
    x = y;
    y = value;
  }
  split2[0] = _keywordToPercent[x] || x;
  split2[1] = _keywordToPercent[y] || y;
  return split2.join(" ");
}, _renderClearProps = function _renderClearProps2(ratio, data) {
  if (data.tween && data.tween._time === data.tween._dur) {
    var target = data.t, style = target.style, props = data.u, cache2 = target._gsap, prop, clearTransforms, i;
    if (props === "all" || props === true) {
      style.cssText = "";
      clearTransforms = 1;
    } else {
      props = props.split(",");
      i = props.length;
      while (--i > -1) {
        prop = props[i];
        if (_transformProps[prop]) {
          clearTransforms = 1;
          prop = prop === "transformOrigin" ? _transformOriginProp : _transformProp;
        }
        _removeProperty(target, prop);
      }
    }
    if (clearTransforms) {
      _removeProperty(target, _transformProp);
      if (cache2) {
        cache2.svg && target.removeAttribute("transform");
        style.scale = style.rotate = style.translate = "none";
        _parseTransform(target, 1);
        cache2.uncache = 1;
        _removeIndependentTransforms(style);
      }
    }
  }
}, _specialProps = {
  clearProps: function clearProps(plugin, target, property, endValue, tween) {
    if (tween.data !== "isFromStart") {
      var pt = plugin._pt = new PropTween(plugin._pt, target, property, 0, 0, _renderClearProps);
      pt.u = endValue;
      pt.pr = -10;
      pt.tween = tween;
      plugin._props.push(property);
      return 1;
    }
  }
  /* className feature (about 0.4kb gzipped).
  , className(plugin, target, property, endValue, tween) {
  	let _renderClassName = (ratio, data) => {
  			data.css.render(ratio, data.css);
  			if (!ratio || ratio === 1) {
  				let inline = data.rmv,
  					target = data.t,
  					p;
  				target.setAttribute("class", ratio ? data.e : data.b);
  				for (p in inline) {
  					_removeProperty(target, p);
  				}
  			}
  		},
  		_getAllStyles = (target) => {
  			let styles = {},
  				computed = getComputedStyle(target),
  				p;
  			for (p in computed) {
  				if (isNaN(p) && p !== "cssText" && p !== "length") {
  					styles[p] = computed[p];
  				}
  			}
  			_setDefaults(styles, _parseTransform(target, 1));
  			return styles;
  		},
  		startClassList = target.getAttribute("class"),
  		style = target.style,
  		cssText = style.cssText,
  		cache = target._gsap,
  		classPT = cache.classPT,
  		inlineToRemoveAtEnd = {},
  		data = {t:target, plugin:plugin, rmv:inlineToRemoveAtEnd, b:startClassList, e:(endValue.charAt(1) !== "=") ? endValue : startClassList.replace(new RegExp("(?:\\s|^)" + endValue.substr(2) + "(?![\\w-])"), "") + ((endValue.charAt(0) === "+") ? " " + endValue.substr(2) : "")},
  		changingVars = {},
  		startVars = _getAllStyles(target),
  		transformRelated = /(transform|perspective)/i,
  		endVars, p;
  	if (classPT) {
  		classPT.r(1, classPT.d);
  		_removeLinkedListItem(classPT.d.plugin, classPT, "_pt");
  	}
  	target.setAttribute("class", data.e);
  	endVars = _getAllStyles(target, true);
  	target.setAttribute("class", startClassList);
  	for (p in endVars) {
  		if (endVars[p] !== startVars[p] && !transformRelated.test(p)) {
  			changingVars[p] = endVars[p];
  			if (!style[p] && style[p] !== "0") {
  				inlineToRemoveAtEnd[p] = 1;
  			}
  		}
  	}
  	cache.classPT = plugin._pt = new PropTween(plugin._pt, target, "className", 0, 0, _renderClassName, data, 0, -11);
  	if (style.cssText !== cssText) { //only apply if things change. Otherwise, in cases like a background-image that's pulled dynamically, it could cause a refresh. See https://gsap.com/forums/topic/20368-possible-gsap-bug-switching-classnames-in-chrome/.
  		style.cssText = cssText; //we recorded cssText before we swapped classes and ran _getAllStyles() because in cases when a className tween is overwritten, we remove all the related tweening properties from that class change (otherwise class-specific stuff can't override properties we've directly set on the target's style object due to specificity).
  	}
  	_parseTransform(target, true); //to clear the caching of transforms
  	data.css = new gsap.plugins.css();
  	data.css.init(target, changingVars, tween);
  	plugin._props.push(...data.css._props);
  	return 1;
  }
  */
}, _identity2DMatrix = [1, 0, 0, 1, 0, 0], _rotationalProperties = {}, _isNullTransform = function _isNullTransform2(value) {
  return value === "matrix(1, 0, 0, 1, 0, 0)" || value === "none" || !value;
}, _getComputedTransformMatrixAsArray = function _getComputedTransformMatrixAsArray2(target) {
  var matrixString = _getComputedProperty(target, _transformProp);
  return _isNullTransform(matrixString) ? _identity2DMatrix : matrixString.substr(7).match(_numExp).map(_round);
}, _getMatrix = function _getMatrix2(target, force2D) {
  var cache2 = target._gsap || _getCache(target), style = target.style, matrix = _getComputedTransformMatrixAsArray(target), parent, nextSibling, temp, addedToDOM;
  if (cache2.svg && target.getAttribute("transform")) {
    temp = target.transform.baseVal.consolidate().matrix;
    matrix = [temp.a, temp.b, temp.c, temp.d, temp.e, temp.f];
    return matrix.join(",") === "1,0,0,1,0,0" ? _identity2DMatrix : matrix;
  } else if (matrix === _identity2DMatrix && !target.offsetParent && target !== _docElement && !cache2.svg) {
    temp = style.display;
    style.display = "block";
    parent = target.parentNode;
    if (!parent || !target.offsetParent && !target.getBoundingClientRect().width) {
      addedToDOM = 1;
      nextSibling = target.nextElementSibling;
      _docElement.appendChild(target);
    }
    matrix = _getComputedTransformMatrixAsArray(target);
    temp ? style.display = temp : _removeProperty(target, "display");
    if (addedToDOM) {
      nextSibling ? parent.insertBefore(target, nextSibling) : parent ? parent.appendChild(target) : _docElement.removeChild(target);
    }
  }
  return force2D && matrix.length > 6 ? [matrix[0], matrix[1], matrix[4], matrix[5], matrix[12], matrix[13]] : matrix;
}, _applySVGOrigin = function _applySVGOrigin2(target, origin, originIsAbsolute, smooth, matrixArray, pluginToAddPropTweensTo) {
  var cache2 = target._gsap, matrix = matrixArray || _getMatrix(target, true), xOriginOld = cache2.xOrigin || 0, yOriginOld = cache2.yOrigin || 0, xOffsetOld = cache2.xOffset || 0, yOffsetOld = cache2.yOffset || 0, a = matrix[0], b = matrix[1], c = matrix[2], d = matrix[3], tx = matrix[4], ty = matrix[5], originSplit = origin.split(" "), xOrigin = parseFloat(originSplit[0]) || 0, yOrigin = parseFloat(originSplit[1]) || 0, bounds, determinant, x, y;
  if (!originIsAbsolute) {
    bounds = _getBBox(target);
    xOrigin = bounds.x + (~originSplit[0].indexOf("%") ? xOrigin / 100 * bounds.width : xOrigin);
    yOrigin = bounds.y + (~(originSplit[1] || originSplit[0]).indexOf("%") ? yOrigin / 100 * bounds.height : yOrigin);
  } else if (matrix !== _identity2DMatrix && (determinant = a * d - b * c)) {
    x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + (c * ty - d * tx) / determinant;
    y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - (a * ty - b * tx) / determinant;
    xOrigin = x;
    yOrigin = y;
  }
  if (smooth || smooth !== false && cache2.smooth) {
    tx = xOrigin - xOriginOld;
    ty = yOrigin - yOriginOld;
    cache2.xOffset = xOffsetOld + (tx * a + ty * c) - tx;
    cache2.yOffset = yOffsetOld + (tx * b + ty * d) - ty;
  } else {
    cache2.xOffset = cache2.yOffset = 0;
  }
  cache2.xOrigin = xOrigin;
  cache2.yOrigin = yOrigin;
  cache2.smooth = !!smooth;
  cache2.origin = origin;
  cache2.originIsAbsolute = !!originIsAbsolute;
  target.style[_transformOriginProp] = "0px 0px";
  if (pluginToAddPropTweensTo) {
    _addNonTweeningPT(pluginToAddPropTweensTo, cache2, "xOrigin", xOriginOld, xOrigin);
    _addNonTweeningPT(pluginToAddPropTweensTo, cache2, "yOrigin", yOriginOld, yOrigin);
    _addNonTweeningPT(pluginToAddPropTweensTo, cache2, "xOffset", xOffsetOld, cache2.xOffset);
    _addNonTweeningPT(pluginToAddPropTweensTo, cache2, "yOffset", yOffsetOld, cache2.yOffset);
  }
  target.setAttribute("data-svg-origin", xOrigin + " " + yOrigin);
}, _parseTransform = function _parseTransform2(target, uncache) {
  var cache2 = target._gsap || new GSCache(target);
  if ("x" in cache2 && !uncache && !cache2.uncache) {
    return cache2;
  }
  var style = target.style, invertedScaleX = cache2.scaleX < 0, px = "px", deg = "deg", cs = getComputedStyle(target), origin = _getComputedProperty(target, _transformOriginProp) || "0", x, y, z, scaleX, scaleY, rotation, rotationX, rotationY, skewX, skewY, perspective, xOrigin, yOrigin, matrix, angle, cos, sin, a, b, c, d, a12, a22, t1, t2, t3, a13, a23, a33, a42, a43, a32;
  x = y = z = rotation = rotationX = rotationY = skewX = skewY = perspective = 0;
  scaleX = scaleY = 1;
  cache2.svg = !!(target.getCTM && _isSVG(target));
  if (cs.translate) {
    if (cs.translate !== "none" || cs.scale !== "none" || cs.rotate !== "none") {
      style[_transformProp] = (cs.translate !== "none" ? "translate3d(" + (cs.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") " : "") + (cs.rotate !== "none" ? "rotate(" + cs.rotate + ") " : "") + (cs.scale !== "none" ? "scale(" + cs.scale.split(" ").join(",") + ") " : "") + (cs[_transformProp] !== "none" ? cs[_transformProp] : "");
    }
    style.scale = style.rotate = style.translate = "none";
  }
  matrix = _getMatrix(target, cache2.svg);
  if (cache2.svg) {
    if (cache2.uncache) {
      t2 = target.getBBox();
      origin = cache2.xOrigin - t2.x + "px " + (cache2.yOrigin - t2.y) + "px";
      t1 = "";
    } else {
      t1 = !uncache && target.getAttribute("data-svg-origin");
    }
    _applySVGOrigin(target, t1 || origin, !!t1 || cache2.originIsAbsolute, cache2.smooth !== false, matrix);
  }
  xOrigin = cache2.xOrigin || 0;
  yOrigin = cache2.yOrigin || 0;
  if (matrix !== _identity2DMatrix) {
    a = matrix[0];
    b = matrix[1];
    c = matrix[2];
    d = matrix[3];
    x = a12 = matrix[4];
    y = a22 = matrix[5];
    if (matrix.length === 6) {
      scaleX = Math.sqrt(a * a + b * b);
      scaleY = Math.sqrt(d * d + c * c);
      rotation = a || b ? _atan2(b, a) * _RAD2DEG : 0;
      skewX = c || d ? _atan2(c, d) * _RAD2DEG + rotation : 0;
      skewX && (scaleY *= Math.abs(Math.cos(skewX * _DEG2RAD)));
      if (cache2.svg) {
        x -= xOrigin - (xOrigin * a + yOrigin * c);
        y -= yOrigin - (xOrigin * b + yOrigin * d);
      }
    } else {
      a32 = matrix[6];
      a42 = matrix[7];
      a13 = matrix[8];
      a23 = matrix[9];
      a33 = matrix[10];
      a43 = matrix[11];
      x = matrix[12];
      y = matrix[13];
      z = matrix[14];
      angle = _atan2(a32, a33);
      rotationX = angle * _RAD2DEG;
      if (angle) {
        cos = Math.cos(-angle);
        sin = Math.sin(-angle);
        t1 = a12 * cos + a13 * sin;
        t2 = a22 * cos + a23 * sin;
        t3 = a32 * cos + a33 * sin;
        a13 = a12 * -sin + a13 * cos;
        a23 = a22 * -sin + a23 * cos;
        a33 = a32 * -sin + a33 * cos;
        a43 = a42 * -sin + a43 * cos;
        a12 = t1;
        a22 = t2;
        a32 = t3;
      }
      angle = _atan2(-c, a33);
      rotationY = angle * _RAD2DEG;
      if (angle) {
        cos = Math.cos(-angle);
        sin = Math.sin(-angle);
        t1 = a * cos - a13 * sin;
        t2 = b * cos - a23 * sin;
        t3 = c * cos - a33 * sin;
        a43 = d * sin + a43 * cos;
        a = t1;
        b = t2;
        c = t3;
      }
      angle = _atan2(b, a);
      rotation = angle * _RAD2DEG;
      if (angle) {
        cos = Math.cos(angle);
        sin = Math.sin(angle);
        t1 = a * cos + b * sin;
        t2 = a12 * cos + a22 * sin;
        b = b * cos - a * sin;
        a22 = a22 * cos - a12 * sin;
        a = t1;
        a12 = t2;
      }
      if (rotationX && Math.abs(rotationX) + Math.abs(rotation) > 359.9) {
        rotationX = rotation = 0;
        rotationY = 180 - rotationY;
      }
      scaleX = _round(Math.sqrt(a * a + b * b + c * c));
      scaleY = _round(Math.sqrt(a22 * a22 + a32 * a32));
      angle = _atan2(a12, a22);
      skewX = Math.abs(angle) > 2e-4 ? angle * _RAD2DEG : 0;
      perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
    }
    if (cache2.svg) {
      t1 = target.getAttribute("transform");
      cache2.forceCSS = target.setAttribute("transform", "") || !_isNullTransform(_getComputedProperty(target, _transformProp));
      t1 && target.setAttribute("transform", t1);
    }
  }
  if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
    if (invertedScaleX) {
      scaleX *= -1;
      skewX += rotation <= 0 ? 180 : -180;
      rotation += rotation <= 0 ? 180 : -180;
    } else {
      scaleY *= -1;
      skewX += skewX <= 0 ? 180 : -180;
    }
  }
  uncache = uncache || cache2.uncache;
  cache2.x = x - ((cache2.xPercent = x && (!uncache && cache2.xPercent || (Math.round(target.offsetWidth / 2) === Math.round(-x) ? -50 : 0))) ? target.offsetWidth * cache2.xPercent / 100 : 0) + px;
  cache2.y = y - ((cache2.yPercent = y && (!uncache && cache2.yPercent || (Math.round(target.offsetHeight / 2) === Math.round(-y) ? -50 : 0))) ? target.offsetHeight * cache2.yPercent / 100 : 0) + px;
  cache2.z = z + px;
  cache2.scaleX = _round(scaleX);
  cache2.scaleY = _round(scaleY);
  cache2.rotation = _round(rotation) + deg;
  cache2.rotationX = _round(rotationX) + deg;
  cache2.rotationY = _round(rotationY) + deg;
  cache2.skewX = skewX + deg;
  cache2.skewY = skewY + deg;
  cache2.transformPerspective = perspective + px;
  if (cache2.zOrigin = parseFloat(origin.split(" ")[2]) || !uncache && cache2.zOrigin || 0) {
    style[_transformOriginProp] = _firstTwoOnly(origin);
  }
  cache2.xOffset = cache2.yOffset = 0;
  cache2.force3D = _config.force3D;
  cache2.renderTransform = cache2.svg ? _renderSVGTransforms : _supports3D ? _renderCSSTransforms : _renderNon3DTransforms;
  cache2.uncache = 0;
  return cache2;
}, _firstTwoOnly = function _firstTwoOnly2(value) {
  return (value = value.split(" "))[0] + " " + value[1];
}, _addPxTranslate = function _addPxTranslate2(target, start2, value) {
  var unit = getUnit(start2);
  return _round(parseFloat(start2) + parseFloat(_convertToUnit(target, "x", value + "px", unit))) + unit;
}, _renderNon3DTransforms = function _renderNon3DTransforms2(ratio, cache2) {
  cache2.z = "0px";
  cache2.rotationY = cache2.rotationX = "0deg";
  cache2.force3D = 0;
  _renderCSSTransforms(ratio, cache2);
}, _zeroDeg = "0deg", _zeroPx = "0px", _endParenthesis = ") ", _renderCSSTransforms = function _renderCSSTransforms2(ratio, cache2) {
  var _ref = cache2 || this, xPercent = _ref.xPercent, yPercent = _ref.yPercent, x = _ref.x, y = _ref.y, z = _ref.z, rotation = _ref.rotation, rotationY = _ref.rotationY, rotationX = _ref.rotationX, skewX = _ref.skewX, skewY = _ref.skewY, scaleX = _ref.scaleX, scaleY = _ref.scaleY, transformPerspective = _ref.transformPerspective, force3D = _ref.force3D, target = _ref.target, zOrigin = _ref.zOrigin, transforms = "", use3D = force3D === "auto" && ratio && ratio !== 1 || force3D === true;
  if (zOrigin && (rotationX !== _zeroDeg || rotationY !== _zeroDeg)) {
    var angle = parseFloat(rotationY) * _DEG2RAD, a13 = Math.sin(angle), a33 = Math.cos(angle), cos;
    angle = parseFloat(rotationX) * _DEG2RAD;
    cos = Math.cos(angle);
    x = _addPxTranslate(target, x, a13 * cos * -zOrigin);
    y = _addPxTranslate(target, y, -Math.sin(angle) * -zOrigin);
    z = _addPxTranslate(target, z, a33 * cos * -zOrigin + zOrigin);
  }
  if (transformPerspective !== _zeroPx) {
    transforms += "perspective(" + transformPerspective + _endParenthesis;
  }
  if (xPercent || yPercent) {
    transforms += "translate(" + xPercent + "%, " + yPercent + "%) ";
  }
  if (use3D || x !== _zeroPx || y !== _zeroPx || z !== _zeroPx) {
    transforms += z !== _zeroPx || use3D ? "translate3d(" + x + ", " + y + ", " + z + ") " : "translate(" + x + ", " + y + _endParenthesis;
  }
  if (rotation !== _zeroDeg) {
    transforms += "rotate(" + rotation + _endParenthesis;
  }
  if (rotationY !== _zeroDeg) {
    transforms += "rotateY(" + rotationY + _endParenthesis;
  }
  if (rotationX !== _zeroDeg) {
    transforms += "rotateX(" + rotationX + _endParenthesis;
  }
  if (skewX !== _zeroDeg || skewY !== _zeroDeg) {
    transforms += "skew(" + skewX + ", " + skewY + _endParenthesis;
  }
  if (scaleX !== 1 || scaleY !== 1) {
    transforms += "scale(" + scaleX + ", " + scaleY + _endParenthesis;
  }
  target.style[_transformProp] = transforms || "translate(0, 0)";
}, _renderSVGTransforms = function _renderSVGTransforms2(ratio, cache2) {
  var _ref2 = cache2 || this, xPercent = _ref2.xPercent, yPercent = _ref2.yPercent, x = _ref2.x, y = _ref2.y, rotation = _ref2.rotation, skewX = _ref2.skewX, skewY = _ref2.skewY, scaleX = _ref2.scaleX, scaleY = _ref2.scaleY, target = _ref2.target, xOrigin = _ref2.xOrigin, yOrigin = _ref2.yOrigin, xOffset = _ref2.xOffset, yOffset = _ref2.yOffset, forceCSS = _ref2.forceCSS, tx = parseFloat(x), ty = parseFloat(y), a11, a21, a12, a22, temp;
  rotation = parseFloat(rotation);
  skewX = parseFloat(skewX);
  skewY = parseFloat(skewY);
  if (skewY) {
    skewY = parseFloat(skewY);
    skewX += skewY;
    rotation += skewY;
  }
  if (rotation || skewX) {
    rotation *= _DEG2RAD;
    skewX *= _DEG2RAD;
    a11 = Math.cos(rotation) * scaleX;
    a21 = Math.sin(rotation) * scaleX;
    a12 = Math.sin(rotation - skewX) * -scaleY;
    a22 = Math.cos(rotation - skewX) * scaleY;
    if (skewX) {
      skewY *= _DEG2RAD;
      temp = Math.tan(skewX - skewY);
      temp = Math.sqrt(1 + temp * temp);
      a12 *= temp;
      a22 *= temp;
      if (skewY) {
        temp = Math.tan(skewY);
        temp = Math.sqrt(1 + temp * temp);
        a11 *= temp;
        a21 *= temp;
      }
    }
    a11 = _round(a11);
    a21 = _round(a21);
    a12 = _round(a12);
    a22 = _round(a22);
  } else {
    a11 = scaleX;
    a22 = scaleY;
    a21 = a12 = 0;
  }
  if (tx && !~(x + "").indexOf("px") || ty && !~(y + "").indexOf("px")) {
    tx = _convertToUnit(target, "x", x, "px");
    ty = _convertToUnit(target, "y", y, "px");
  }
  if (xOrigin || yOrigin || xOffset || yOffset) {
    tx = _round(tx + xOrigin - (xOrigin * a11 + yOrigin * a12) + xOffset);
    ty = _round(ty + yOrigin - (xOrigin * a21 + yOrigin * a22) + yOffset);
  }
  if (xPercent || yPercent) {
    temp = target.getBBox();
    tx = _round(tx + xPercent / 100 * temp.width);
    ty = _round(ty + yPercent / 100 * temp.height);
  }
  temp = "matrix(" + a11 + "," + a21 + "," + a12 + "," + a22 + "," + tx + "," + ty + ")";
  target.setAttribute("transform", temp);
  forceCSS && (target.style[_transformProp] = temp);
}, _addRotationalPropTween = function _addRotationalPropTween2(plugin, target, property, startNum, endValue) {
  var cap = 360, isString2 = _isString(endValue), endNum = parseFloat(endValue) * (isString2 && ~endValue.indexOf("rad") ? _RAD2DEG : 1), change = endNum - startNum, finalValue = startNum + change + "deg", direction, pt;
  if (isString2) {
    direction = endValue.split("_")[1];
    if (direction === "short") {
      change %= cap;
      if (change !== change % (cap / 2)) {
        change += change < 0 ? cap : -cap;
      }
    }
    if (direction === "cw" && change < 0) {
      change = (change + cap * _bigNum) % cap - ~~(change / cap) * cap;
    } else if (direction === "ccw" && change > 0) {
      change = (change - cap * _bigNum) % cap - ~~(change / cap) * cap;
    }
  }
  plugin._pt = pt = new PropTween(plugin._pt, target, property, startNum, change, _renderPropWithEnd);
  pt.e = finalValue;
  pt.u = "deg";
  plugin._props.push(property);
  return pt;
}, _assign = function _assign2(target, source) {
  for (var p in source) {
    target[p] = source[p];
  }
  return target;
}, _addRawTransformPTs = function _addRawTransformPTs2(plugin, transforms, target) {
  var startCache = _assign({}, target._gsap), exclude = "perspective,force3D,transformOrigin,svgOrigin", style = target.style, endCache, p, startValue, endValue, startNum, endNum, startUnit, endUnit;
  if (startCache.svg) {
    startValue = target.getAttribute("transform");
    target.setAttribute("transform", "");
    style[_transformProp] = transforms;
    endCache = _parseTransform(target, 1);
    _removeProperty(target, _transformProp);
    target.setAttribute("transform", startValue);
  } else {
    startValue = getComputedStyle(target)[_transformProp];
    style[_transformProp] = transforms;
    endCache = _parseTransform(target, 1);
    style[_transformProp] = startValue;
  }
  for (p in _transformProps) {
    startValue = startCache[p];
    endValue = endCache[p];
    if (startValue !== endValue && exclude.indexOf(p) < 0) {
      startUnit = getUnit(startValue);
      endUnit = getUnit(endValue);
      startNum = startUnit !== endUnit ? _convertToUnit(target, p, startValue, endUnit) : parseFloat(startValue);
      endNum = parseFloat(endValue);
      plugin._pt = new PropTween(plugin._pt, endCache, p, startNum, endNum - startNum, _renderCSSProp);
      plugin._pt.u = endUnit || 0;
      plugin._props.push(p);
    }
  }
  _assign(endCache, startCache);
};
_forEachName("padding,margin,Width,Radius", function(name, index) {
  var t = "Top", r = "Right", b = "Bottom", l = "Left", props = (index < 3 ? [t, r, b, l] : [t + l, t + r, b + r, b + l]).map(function(side) {
    return index < 2 ? name + side : "border" + side + name;
  });
  _specialProps[index > 1 ? "border" + name : name] = function(plugin, target, property, endValue, tween) {
    var a, vars;
    if (arguments.length < 4) {
      a = props.map(function(prop) {
        return _get(plugin, prop, property);
      });
      vars = a.join(" ");
      return vars.split(a[0]).length === 5 ? a[0] : vars;
    }
    a = (endValue + "").split(" ");
    vars = {};
    props.forEach(function(prop, i) {
      return vars[prop] = a[i] = a[i] || a[(i - 1) / 2 | 0];
    });
    plugin.init(target, vars, tween);
  };
});
var CSSPlugin = {
  name: "css",
  register: _initCore,
  targetTest: function targetTest(target) {
    return target.style && target.nodeType;
  },
  init: function init3(target, vars, tween, index, targets) {
    var props = this._props, style = target.style, startAt = tween.vars.startAt, startValue, endValue, endNum, startNum, type, specialProp, p, startUnit, endUnit, relative, isTransformRelated, transformPropTween, cache2, smooth, hasPriority, inlineProps;
    _pluginInitted || _initCore();
    this.styles = this.styles || _getStyleSaver(target);
    inlineProps = this.styles.props;
    this.tween = tween;
    for (p in vars) {
      if (p === "autoRound") {
        continue;
      }
      endValue = vars[p];
      if (_plugins[p] && _checkPlugin(p, vars, tween, index, target, targets)) {
        continue;
      }
      type = typeof endValue;
      specialProp = _specialProps[p];
      if (type === "function") {
        endValue = endValue.call(tween, index, target, targets);
        type = typeof endValue;
      }
      if (type === "string" && ~endValue.indexOf("random(")) {
        endValue = _replaceRandom(endValue);
      }
      if (specialProp) {
        specialProp(this, target, p, endValue, tween) && (hasPriority = 1);
      } else if (p.substr(0, 2) === "--") {
        startValue = (getComputedStyle(target).getPropertyValue(p) + "").trim();
        endValue += "";
        _colorExp.lastIndex = 0;
        if (!_colorExp.test(startValue)) {
          startUnit = getUnit(startValue);
          endUnit = getUnit(endValue);
        }
        endUnit ? startUnit !== endUnit && (startValue = _convertToUnit(target, p, startValue, endUnit) + endUnit) : startUnit && (endValue += startUnit);
        this.add(style, "setProperty", startValue, endValue, index, targets, 0, 0, p);
        props.push(p);
        inlineProps.push(p, 0, style[p]);
      } else if (type !== "undefined") {
        if (startAt && p in startAt) {
          startValue = typeof startAt[p] === "function" ? startAt[p].call(tween, index, target, targets) : startAt[p];
          _isString(startValue) && ~startValue.indexOf("random(") && (startValue = _replaceRandom(startValue));
          getUnit(startValue + "") || startValue === "auto" || (startValue += _config.units[p] || getUnit(_get(target, p)) || "");
          (startValue + "").charAt(1) === "=" && (startValue = _get(target, p));
        } else {
          startValue = _get(target, p);
        }
        startNum = parseFloat(startValue);
        relative = type === "string" && endValue.charAt(1) === "=" && endValue.substr(0, 2);
        relative && (endValue = endValue.substr(2));
        endNum = parseFloat(endValue);
        if (p in _propertyAliases) {
          if (p === "autoAlpha") {
            if (startNum === 1 && _get(target, "visibility") === "hidden" && endNum) {
              startNum = 0;
            }
            inlineProps.push("visibility", 0, style.visibility);
            _addNonTweeningPT(this, style, "visibility", startNum ? "inherit" : "hidden", endNum ? "inherit" : "hidden", !endNum);
          }
          if (p !== "scale" && p !== "transform") {
            p = _propertyAliases[p];
            ~p.indexOf(",") && (p = p.split(",")[0]);
          }
        }
        isTransformRelated = p in _transformProps;
        if (isTransformRelated) {
          this.styles.save(p);
          if (type === "string" && endValue.substring(0, 6) === "var(--") {
            endValue = _getComputedProperty(target, endValue.substring(4, endValue.indexOf(")")));
            endNum = parseFloat(endValue);
          }
          if (!transformPropTween) {
            cache2 = target._gsap;
            cache2.renderTransform && !vars.parseTransform || _parseTransform(target, vars.parseTransform);
            smooth = vars.smoothOrigin !== false && cache2.smooth;
            transformPropTween = this._pt = new PropTween(this._pt, style, _transformProp, 0, 1, cache2.renderTransform, cache2, 0, -1);
            transformPropTween.dep = 1;
          }
          if (p === "scale") {
            this._pt = new PropTween(this._pt, cache2, "scaleY", cache2.scaleY, (relative ? _parseRelative(cache2.scaleY, relative + endNum) : endNum) - cache2.scaleY || 0, _renderCSSProp);
            this._pt.u = 0;
            props.push("scaleY", p);
            p += "X";
          } else if (p === "transformOrigin") {
            inlineProps.push(_transformOriginProp, 0, style[_transformOriginProp]);
            endValue = _convertKeywordsToPercentages(endValue);
            if (cache2.svg) {
              _applySVGOrigin(target, endValue, 0, smooth, 0, this);
            } else {
              endUnit = parseFloat(endValue.split(" ")[2]) || 0;
              endUnit !== cache2.zOrigin && _addNonTweeningPT(this, cache2, "zOrigin", cache2.zOrigin, endUnit);
              _addNonTweeningPT(this, style, p, _firstTwoOnly(startValue), _firstTwoOnly(endValue));
            }
            continue;
          } else if (p === "svgOrigin") {
            _applySVGOrigin(target, endValue, 1, smooth, 0, this);
            continue;
          } else if (p in _rotationalProperties) {
            _addRotationalPropTween(this, cache2, p, startNum, relative ? _parseRelative(startNum, relative + endValue) : endValue);
            continue;
          } else if (p === "smoothOrigin") {
            _addNonTweeningPT(this, cache2, "smooth", cache2.smooth, endValue);
            continue;
          } else if (p === "force3D") {
            cache2[p] = endValue;
            continue;
          } else if (p === "transform") {
            _addRawTransformPTs(this, endValue, target);
            continue;
          }
        } else if (!(p in style)) {
          p = _checkPropPrefix(p) || p;
        }
        if (isTransformRelated || (endNum || endNum === 0) && (startNum || startNum === 0) && !_complexExp.test(endValue) && p in style) {
          startUnit = (startValue + "").substr((startNum + "").length);
          endNum || (endNum = 0);
          endUnit = getUnit(endValue) || (p in _config.units ? _config.units[p] : startUnit);
          startUnit !== endUnit && (startNum = _convertToUnit(target, p, startValue, endUnit));
          this._pt = new PropTween(this._pt, isTransformRelated ? cache2 : style, p, startNum, (relative ? _parseRelative(startNum, relative + endNum) : endNum) - startNum, !isTransformRelated && (endUnit === "px" || p === "zIndex") && vars.autoRound !== false ? _renderRoundedCSSProp : _renderCSSProp);
          this._pt.u = endUnit || 0;
          if (startUnit !== endUnit && endUnit !== "%") {
            this._pt.b = startValue;
            this._pt.r = _renderCSSPropWithBeginning;
          }
        } else if (!(p in style)) {
          if (p in target) {
            this.add(target, p, startValue || target[p], relative ? relative + endValue : endValue, index, targets);
          } else if (p !== "parseTransform") {
            _missingPlugin(p, endValue);
            continue;
          }
        } else {
          _tweenComplexCSSString.call(this, target, p, startValue, relative ? relative + endValue : endValue);
        }
        isTransformRelated || (p in style ? inlineProps.push(p, 0, style[p]) : typeof target[p] === "function" ? inlineProps.push(p, 2, target[p]()) : inlineProps.push(p, 1, startValue || target[p]));
        props.push(p);
      }
    }
    hasPriority && _sortPropTweensByPriority(this);
  },
  render: function render3(ratio, data) {
    if (data.tween._time || !_reverting()) {
      var pt = data._pt;
      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }
    } else {
      data.styles.revert();
    }
  },
  get: _get,
  aliases: _propertyAliases,
  getSetter: function getSetter(target, property, plugin) {
    var p = _propertyAliases[property];
    p && p.indexOf(",") < 0 && (property = p);
    return property in _transformProps && property !== _transformOriginProp && (target._gsap.x || _get(target, "x")) ? plugin && _recentSetterPlugin === plugin ? property === "scale" ? _setterScale : _setterTransform : (_recentSetterPlugin = plugin || {}) && (property === "scale" ? _setterScaleWithRender : _setterTransformWithRender) : target.style && !_isUndefined(target.style[property]) ? _setterCSSStyle : ~property.indexOf("-") ? _setterCSSProp : _getSetter(target, property);
  },
  core: {
    _removeProperty,
    _getMatrix
  }
};
gsap.utils.checkPrefix = _checkPropPrefix;
gsap.core.getStyleSaver = _getStyleSaver;
(function(positionAndScale, rotation, others, aliases) {
  var all = _forEachName(positionAndScale + "," + rotation + "," + others, function(name) {
    _transformProps[name] = 1;
  });
  _forEachName(rotation, function(name) {
    _config.units[name] = "deg";
    _rotationalProperties[name] = 1;
  });
  _propertyAliases[all[13]] = positionAndScale + "," + rotation;
  _forEachName(aliases, function(name) {
    var split2 = name.split(":");
    _propertyAliases[split2[1]] = all[split2[0]];
  });
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");
_forEachName("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(name) {
  _config.units[name] = "px";
});
gsap.registerPlugin(CSSPlugin);
var gsapWithCSS = gsap.registerPlugin(CSSPlugin) || gsap;
gsapWithCSS.core.Tween;
(function() {
  function append2() {
    var length = arguments.length;
    for (var i = 0; i < length; i++) {
      var node = i < 0 || arguments.length <= i ? void 0 : arguments[i];
      if (node.nodeType === 1 || node.nodeType === 11) this.appendChild(node);
      else this.appendChild(document.createTextNode(String(node)));
    }
  }
  function replaceChildren() {
    while (this.lastChild) {
      this.removeChild(this.lastChild);
    }
    if (arguments.length) this.append.apply(this, arguments);
  }
  function replaceWith() {
    var parent = this.parentNode;
    for (var _len = arguments.length, nodes = new Array(_len), _key = 0; _key < _len; _key++) {
      nodes[_key] = arguments[_key];
    }
    var i = nodes.length;
    if (!parent) return;
    if (!i) parent.removeChild(this);
    while (i--) {
      var node = nodes[i];
      if (typeof node !== "object") {
        node = this.ownerDocument.createTextNode(node);
      } else if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
      if (!i) {
        parent.replaceChild(node, this);
      } else {
        parent.insertBefore(this.previousSibling, node);
      }
    }
  }
  if (typeof Element !== "undefined") {
    if (!Element.prototype.append) {
      Element.prototype.append = append2;
      DocumentFragment.prototype.append = append2;
    }
    if (!Element.prototype.replaceChildren) {
      Element.prototype.replaceChildren = replaceChildren;
      DocumentFragment.prototype.replaceChildren = replaceChildren;
    }
    if (!Element.prototype.replaceWith) {
      Element.prototype.replaceWith = replaceWith;
      DocumentFragment.prototype.replaceWith = replaceWith;
    }
  }
})();
function _classCallCheck(instance2, Constructor) {
  if (!(instance2 instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}
function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = void 0;
  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function extend(target, object) {
  return Object.getOwnPropertyNames(Object(target)).reduce(function(extended, key) {
    var currentValue = Object.getOwnPropertyDescriptor(Object(target), key);
    var newValue = Object.getOwnPropertyDescriptor(Object(object), key);
    return Object.defineProperty(extended, key, newValue || currentValue);
  }, {});
}
function isString(value) {
  return typeof value === "string";
}
function isArray(value) {
  return Array.isArray(value);
}
function parseSettings() {
  var settings = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  var object = extend(settings);
  var types;
  if (object.types !== void 0) {
    types = object.types;
  } else if (object.split !== void 0) {
    types = object.split;
  }
  if (types !== void 0) {
    object.types = (isString(types) || isArray(types) ? String(types) : "").split(",").map(function(type) {
      return String(type).trim();
    }).filter(function(type) {
      return /((line)|(word)|(char))/i.test(type);
    });
  }
  if (object.absolute || object.position) {
    object.absolute = object.absolute || /absolute/.test(settings.position);
  }
  return object;
}
function parseTypes(value) {
  var types = isString(value) || isArray(value) ? String(value) : "";
  return {
    none: !types,
    lines: /line/i.test(types),
    words: /word/i.test(types),
    chars: /char/i.test(types)
  };
}
function isObject(value) {
  return value !== null && typeof value === "object";
}
function isNode(input) {
  return isObject(input) && /^(1|3|11)$/.test(input.nodeType);
}
function isLength(value) {
  return typeof value === "number" && value > -1 && value % 1 === 0;
}
function isArrayLike(value) {
  return isObject(value) && isLength(value.length);
}
function toArray(value) {
  if (isArray(value)) return value;
  if (value == null) return [];
  return isArrayLike(value) ? Array.prototype.slice.call(value) : [value];
}
function getTargetElements(target) {
  var elements = target;
  if (isString(target)) {
    if (/^(#[a-z]\w+)$/.test(target.trim())) {
      elements = document.getElementById(target.trim().slice(1));
    } else {
      elements = document.querySelectorAll(target);
    }
  }
  return toArray(elements).reduce(function(result, element2) {
    return [].concat(_toConsumableArray(result), _toConsumableArray(toArray(element2).filter(isNode)));
  }, []);
}
var entries = Object.entries;
var expando = "_splittype";
var cache = {};
var uid = 0;
function set(owner, key, value) {
  if (!isObject(owner)) {
    console.warn("[data.set] owner is not an object");
    return null;
  }
  var id = owner[expando] || (owner[expando] = ++uid);
  var data = cache[id] || (cache[id] = {});
  if (value === void 0) {
    if (!!key && Object.getPrototypeOf(key) === Object.prototype) {
      cache[id] = _objectSpread2(_objectSpread2({}, data), key);
    }
  } else if (key !== void 0) {
    data[key] = value;
  }
  return value;
}
function get(owner, key) {
  var id = isObject(owner) ? owner[expando] : null;
  var data = id && cache[id] || {};
  {
    return data;
  }
}
function remove(element2) {
  var id = element2 && element2[expando];
  if (id) {
    delete element2[id];
    delete cache[id];
  }
}
function clear() {
  Object.keys(cache).forEach(function(key) {
    delete cache[key];
  });
}
function cleanup() {
  entries(cache).forEach(function(_ref) {
    var _ref2 = _slicedToArray(_ref, 2), id = _ref2[0], _ref2$ = _ref2[1], isRoot = _ref2$.isRoot, isSplit = _ref2$.isSplit;
    if (!isRoot || !isSplit) {
      cache[id] = null;
      delete cache[id];
    }
  });
}
function toWords(value) {
  var separator = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : " ";
  var string = value ? String(value) : "";
  return string.trim().replace(/\s+/g, " ").split(separator);
}
var rsAstralRange = "\\ud800-\\udfff";
var rsComboMarksRange = "\\u0300-\\u036f\\ufe20-\\ufe23";
var rsComboSymbolsRange = "\\u20d0-\\u20f0";
var rsVarRange = "\\ufe0e\\ufe0f";
var rsAstral = "[".concat(rsAstralRange, "]");
var rsCombo = "[".concat(rsComboMarksRange).concat(rsComboSymbolsRange, "]");
var rsFitz = "\\ud83c[\\udffb-\\udfff]";
var rsModifier = "(?:".concat(rsCombo, "|").concat(rsFitz, ")");
var rsNonAstral = "[^".concat(rsAstralRange, "]");
var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
var rsZWJ = "\\u200d";
var reOptMod = "".concat(rsModifier, "?");
var rsOptVar = "[".concat(rsVarRange, "]?");
var rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*";
var rsSeq = rsOptVar + reOptMod + rsOptJoin;
var rsSymbol = "(?:".concat(["".concat(rsNonAstral).concat(rsCombo, "?"), rsCombo, rsRegional, rsSurrPair, rsAstral].join("|"), "\n)");
var reUnicode = RegExp("".concat(rsFitz, "(?=").concat(rsFitz, ")|").concat(rsSymbol).concat(rsSeq), "g");
var unicodeRange = [rsZWJ, rsAstralRange, rsComboMarksRange, rsComboSymbolsRange, rsVarRange];
var reHasUnicode = RegExp("[".concat(unicodeRange.join(""), "]"));
function asciiToArray(string) {
  return string.split("");
}
function hasUnicode(string) {
  return reHasUnicode.test(string);
}
function unicodeToArray(string) {
  return string.match(reUnicode) || [];
}
function stringToArray(string) {
  return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
}
function toString(value) {
  return value == null ? "" : String(value);
}
function toChars(string) {
  var separator = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
  string = toString(string);
  if (string && isString(string)) {
    if (!separator && hasUnicode(string)) {
      return stringToArray(string);
    }
  }
  return string.split(separator);
}
function createElement(name, attributes) {
  var element2 = document.createElement(name);
  if (!attributes) {
    return element2;
  }
  Object.keys(attributes).forEach(function(attribute) {
    var rawValue = attributes[attribute];
    var value = isString(rawValue) ? rawValue.trim() : rawValue;
    if (value === null || value === "") return;
    if (attribute === "children") {
      element2.append.apply(element2, _toConsumableArray(toArray(value)));
    } else {
      element2.setAttribute(attribute, value);
    }
  });
  return element2;
}
var defaults2 = {
  splitClass: "",
  lineClass: "line",
  wordClass: "word",
  charClass: "char",
  types: ["lines", "words", "chars"],
  absolute: false,
  tagName: "div"
};
function splitWordsAndChars(textNode, settings) {
  settings = extend(defaults2, settings);
  var types = parseTypes(settings.types);
  var TAG_NAME = settings.tagName;
  var VALUE = textNode.nodeValue;
  var splitText = document.createDocumentFragment();
  var words = [];
  var chars = [];
  if (/^\s/.test(VALUE)) {
    splitText.append(" ");
  }
  words = toWords(VALUE).reduce(function(result, WORD, idx, arr) {
    var wordElement;
    var characterElementsForCurrentWord;
    if (types.chars) {
      characterElementsForCurrentWord = toChars(WORD).map(function(CHAR) {
        var characterElement = createElement(TAG_NAME, {
          "class": "".concat(settings.splitClass, " ").concat(settings.charClass),
          style: "display: inline-block;",
          children: CHAR
        });
        set(characterElement, "isChar", true);
        chars = [].concat(_toConsumableArray(chars), [characterElement]);
        return characterElement;
      });
    }
    if (types.words || types.lines) {
      wordElement = createElement(TAG_NAME, {
        "class": "".concat(settings.wordClass, " ").concat(settings.splitClass),
        style: "display: inline-block; ".concat(types.words && settings.absolute ? "position: relative;" : ""),
        children: types.chars ? characterElementsForCurrentWord : WORD
      });
      set(wordElement, {
        isWord: true,
        isWordStart: true,
        isWordEnd: true
      });
      splitText.appendChild(wordElement);
    } else {
      characterElementsForCurrentWord.forEach(function(characterElement) {
        splitText.appendChild(characterElement);
      });
    }
    if (idx < arr.length - 1) {
      splitText.append(" ");
    }
    return types.words ? result.concat(wordElement) : result;
  }, []);
  if (/\s$/.test(VALUE)) {
    splitText.append(" ");
  }
  textNode.replaceWith(splitText);
  return {
    words,
    chars
  };
}
function split(node, settings) {
  var type = node.nodeType;
  var wordsAndChars = {
    words: [],
    chars: []
  };
  if (!/(1|3|11)/.test(type)) {
    return wordsAndChars;
  }
  if (type === 3 && /\S/.test(node.nodeValue)) {
    return splitWordsAndChars(node, settings);
  }
  var childNodes = toArray(node.childNodes);
  if (childNodes.length) {
    set(node, "isSplit", true);
    if (!get(node).isRoot) {
      node.style.display = "inline-block";
      node.style.position = "relative";
      var nextSibling = node.nextSibling;
      var prevSibling = node.previousSibling;
      var text2 = node.textContent || "";
      var textAfter = nextSibling ? nextSibling.textContent : " ";
      var textBefore = prevSibling ? prevSibling.textContent : " ";
      set(node, {
        isWordEnd: /\s$/.test(text2) || /^\s/.test(textAfter),
        isWordStart: /^\s/.test(text2) || /\s$/.test(textBefore)
      });
    }
  }
  return childNodes.reduce(function(result, child) {
    var _split = split(child, settings), words = _split.words, chars = _split.chars;
    return {
      words: [].concat(_toConsumableArray(result.words), _toConsumableArray(words)),
      chars: [].concat(_toConsumableArray(result.chars), _toConsumableArray(chars))
    };
  }, wordsAndChars);
}
function getPosition(node, isWord, settings, scrollPos) {
  if (!settings.absolute) {
    return {
      top: isWord ? node.offsetTop : null
    };
  }
  var parent = node.offsetParent;
  var _scrollPos = _slicedToArray(scrollPos, 2), scrollX = _scrollPos[0], scrollY2 = _scrollPos[1];
  var parentX = 0;
  var parentY = 0;
  if (parent && parent !== document.body) {
    var parentRect = parent.getBoundingClientRect();
    parentX = parentRect.x + scrollX;
    parentY = parentRect.y + scrollY2;
  }
  var _node$getBoundingClie = node.getBoundingClientRect(), width = _node$getBoundingClie.width, height = _node$getBoundingClie.height, x = _node$getBoundingClie.x, y = _node$getBoundingClie.y;
  var top2 = y + scrollY2 - parentY;
  var left2 = x + scrollX - parentX;
  return {
    width,
    height,
    top: top2,
    left: left2
  };
}
function unSplitWords(element2) {
  if (!get(element2).isWord) {
    toArray(element2.children).forEach(function(child) {
      return unSplitWords(child);
    });
  } else {
    remove(element2);
    element2.replaceWith.apply(element2, _toConsumableArray(element2.childNodes));
  }
}
var createFragment = function createFragment2() {
  return document.createDocumentFragment();
};
function repositionAfterSplit(element2, settings, scrollPos) {
  var types = parseTypes(settings.types);
  var TAG_NAME = settings.tagName;
  var nodes = element2.getElementsByTagName("*");
  var wordsInEachLine = [];
  var wordsInCurrentLine = [];
  var lineOffsetY = null;
  var elementHeight;
  var elementWidth;
  var contentBox;
  var lines = [];
  var parent = element2.parentElement;
  var nextSibling = element2.nextElementSibling;
  var splitText = createFragment();
  var cs = window.getComputedStyle(element2);
  var align = cs.textAlign;
  var fontSize = parseFloat(cs.fontSize);
  var lineThreshold = fontSize * 0.2;
  if (settings.absolute) {
    contentBox = {
      left: element2.offsetLeft,
      top: element2.offsetTop,
      width: element2.offsetWidth
    };
    elementWidth = element2.offsetWidth;
    elementHeight = element2.offsetHeight;
    set(element2, {
      cssWidth: element2.style.width,
      cssHeight: element2.style.height
    });
  }
  toArray(nodes).forEach(function(node) {
    var isWordLike = node.parentElement === element2;
    var _getPosition = getPosition(node, isWordLike, settings, scrollPos), width = _getPosition.width, height = _getPosition.height, top2 = _getPosition.top, left2 = _getPosition.left;
    if (/^br$/i.test(node.nodeName)) return;
    if (types.lines && isWordLike) {
      if (lineOffsetY === null || top2 - lineOffsetY >= lineThreshold) {
        lineOffsetY = top2;
        wordsInEachLine.push(wordsInCurrentLine = []);
      }
      wordsInCurrentLine.push(node);
    }
    if (settings.absolute) {
      set(node, {
        top: top2,
        left: left2,
        width,
        height
      });
    }
  });
  if (parent) {
    parent.removeChild(element2);
  }
  if (types.lines) {
    lines = wordsInEachLine.map(function(wordsInThisLine) {
      var lineElement = createElement(TAG_NAME, {
        "class": "".concat(settings.splitClass, " ").concat(settings.lineClass),
        style: "display: block; text-align: ".concat(align, "; width: 100%;")
      });
      set(lineElement, "isLine", true);
      var lineDimensions = {
        height: 0,
        top: 1e4
      };
      splitText.appendChild(lineElement);
      wordsInThisLine.forEach(function(wordOrElement, idx, arr) {
        var _data$get = get(wordOrElement), isWordEnd = _data$get.isWordEnd, top2 = _data$get.top, height = _data$get.height;
        var next = arr[idx + 1];
        lineDimensions.height = Math.max(lineDimensions.height, height);
        lineDimensions.top = Math.min(lineDimensions.top, top2);
        lineElement.appendChild(wordOrElement);
        if (isWordEnd && get(next).isWordStart) {
          lineElement.append(" ");
        }
      });
      if (settings.absolute) {
        set(lineElement, {
          height: lineDimensions.height,
          top: lineDimensions.top
        });
      }
      return lineElement;
    });
    if (!types.words) {
      unSplitWords(splitText);
    }
    element2.replaceChildren(splitText);
  }
  if (settings.absolute) {
    element2.style.width = "".concat(element2.style.width || elementWidth, "px");
    element2.style.height = "".concat(elementHeight, "px");
    toArray(nodes).forEach(function(node) {
      var _data$get2 = get(node), isLine = _data$get2.isLine, top2 = _data$get2.top, left2 = _data$get2.left, width = _data$get2.width, height = _data$get2.height;
      var parentData = get(node.parentElement);
      var isChildOfLineNode = !isLine && parentData.isLine;
      node.style.top = "".concat(isChildOfLineNode ? top2 - parentData.top : top2, "px");
      node.style.left = isLine ? "".concat(contentBox.left, "px") : "".concat(left2 - (isChildOfLineNode ? contentBox.left : 0), "px");
      node.style.height = "".concat(height, "px");
      node.style.width = isLine ? "".concat(contentBox.width, "px") : "".concat(width, "px");
      node.style.position = "absolute";
    });
  }
  if (parent) {
    if (nextSibling) parent.insertBefore(element2, nextSibling);
    else parent.appendChild(element2);
  }
  return lines;
}
var _defaults = extend(defaults2, {});
var SplitType = /* @__PURE__ */ (function() {
  _createClass(SplitType2, null, [{
    key: "clearData",
    /**
     * CLears all data
     */
    value: function clearData() {
      clear();
    }
    /**
     * The default settings for all splitType instances
     * @static
     */
  }, {
    key: "setDefaults",
    /**
     * Sets the default settings for all SplitType instances.
     * The provided object will be merged with the existing defaults objects.
     *
     * @param {Object} settings an object containing the settings to override
     * @returns {Object} the new default settings
     * @public
     * @static
     * @example
     * SplitType.setDefaults({ "position": "absolute" })
     */
    value: function setDefaults(options) {
      _defaults = extend(_defaults, parseSettings(options));
      return defaults2;
    }
    /**
     * Revert target elements to their original html content
     * Has no effect on that
     *
     * @param {any} elements The target elements to revert. One of:
     *  - {string} A css selector
     *  - {HTMLElement} A single element
     * -  {NodeList} A NodeList or collection
     *  - {HTMLElement[]} An array of Elements
     * -  {Array<HTMLElement|NodeList|HTMLElement[]>} A nested array of elements
     * @static
     */
  }, {
    key: "revert",
    value: function revert(elements) {
      getTargetElements(elements).forEach(function(element2) {
        var _data$get = get(element2), isSplit = _data$get.isSplit, html2 = _data$get.html, cssWidth = _data$get.cssWidth, cssHeight = _data$get.cssHeight;
        if (isSplit) {
          element2.innerHTML = html2;
          element2.style.width = cssWidth || "";
          element2.style.height = cssHeight || "";
          remove(element2);
        }
      });
    }
    /**
     * Creates a new SplitType instance
     * This static method provides a way to create a `SplitType` instance without
     * using the `new` keyword.
     *
     * @param {any} target The target elements to split. One of:
     *  - {string} A css selector
     *  - {HTMLElement} A single element
     * -  {NodeList} A NodeList or collection
     *  - {HTMLElement[]} An array of Elements
     * -  {Array<HTMLElement|NodeList|HTMLElement[]>} A nested array of elements
     * @param {Object} [options] Settings for the SplitType instance
     * @return {SplitType} the SplitType instance
     * @static
     */
  }, {
    key: "create",
    value: function create(target, options) {
      return new SplitType2(target, options);
    }
    /**
     * Creates a new `SplitType` instance
     *
     * @param {any} elements The target elements to split. One of:
     *  - {string} A css selector
     *  - {HTMLElement} A single element
     * -  {NodeList} A NodeList or collection
     *  - {HTMLElement[]} An array of Elements
     * -  {Array<HTMLElement|NodeList|HTMLElement[]>} A nested array of elements
     * @param {Object} [options] Settings for the SplitType instance
     */
  }, {
    key: "data",
    /**
     * The internal data store
     */
    get: function get2() {
      return cache;
    }
  }, {
    key: "defaults",
    get: function get2() {
      return _defaults;
    },
    set: function set2(options) {
      _defaults = extend(_defaults, parseSettings(options));
    }
  }]);
  function SplitType2(elements, options) {
    _classCallCheck(this, SplitType2);
    this.isSplit = false;
    this.settings = extend(_defaults, parseSettings(options));
    this.elements = getTargetElements(elements);
    this.split();
  }
  _createClass(SplitType2, [{
    key: "split",
    value: function split$1(options) {
      var _this = this;
      this.revert();
      this.elements.forEach(function(element2) {
        set(element2, "html", element2.innerHTML);
      });
      this.lines = [];
      this.words = [];
      this.chars = [];
      var scrollPos = [window.pageXOffset, window.pageYOffset];
      if (options !== void 0) {
        this.settings = extend(this.settings, parseSettings(options));
      }
      var types = parseTypes(this.settings.types);
      if (types.none) {
        return;
      }
      this.elements.forEach(function(element2) {
        set(element2, "isRoot", true);
        var _split2 = split(element2, _this.settings), words = _split2.words, chars = _split2.chars;
        _this.words = [].concat(_toConsumableArray(_this.words), _toConsumableArray(words));
        _this.chars = [].concat(_toConsumableArray(_this.chars), _toConsumableArray(chars));
      });
      this.elements.forEach(function(element2) {
        if (types.lines || _this.settings.absolute) {
          var lines = repositionAfterSplit(element2, _this.settings, scrollPos);
          _this.lines = [].concat(_toConsumableArray(_this.lines), _toConsumableArray(lines));
        }
      });
      this.isSplit = true;
      window.scrollTo(scrollPos[0], scrollPos[1]);
      cleanup();
    }
    /**
     * Reverts target element(s) back to their original html content
     * Deletes all stored data associated with the target elements
     * Resets the properties on the splitType instance
     *
     * @public
     */
  }, {
    key: "revert",
    value: function revert() {
      if (this.isSplit) {
        this.lines = null;
        this.words = null;
        this.chars = null;
        this.isSplit = false;
      }
      SplitType2.revert(this.elements);
    }
  }]);
  return SplitType2;
})();
const ONCE_ATTR = '[data-fls-preloader="true"]';
const ONCE_KEY = "fls-preloader:" + location.pathname;
const html = document.documentElement;
function lockScroll() {
  html.setAttribute("data-fls-scrolllock", "");
}
function markLoading() {
  html.setAttribute("data-fls-preloader-loading", "");
}
function markLoaded() {
  html.setAttribute("data-fls-preloader-loaded", "");
  html.removeAttribute("data-fls-preloader-loading");
  html.removeAttribute("data-fls-scrolllock");
}
function imagesReadyPromise() {
  const imgs = Array.from(document.querySelectorAll("img"));
  if (!imgs.length) return Promise.resolve();
  return Promise.allSettled(imgs.map((el) => new Promise((res) => {
    const p = new Image();
    p.onload = p.onerror = res;
    p.src = el.dataset.src || el.currentSrc || el.src;
    if (el.srcset) p.srcset = el.srcset;
    if (el.sizes) p.sizes = el.sizes;
  })));
}
function runGsapPreloader() {
  const splitTitle = new SplitType(".chars", { types: "chars" });
  const splitMade = new SplitType(".preloader__text", { types: "chars" });
  const chars = splitTitle.chars;
  const charsMade = splitMade.chars;
  const tl = gsapWithCSS.timeline({
    defaults: { ease: "power2.out" }
  });
  tl.set(".preloader__line", { yPercent: -100 }).set(".preloader__image img", { opacity: 0, scale: 0 }).to(".preloader__line", { yPercent: 0, stagger: 0.3, duration: 0.3, delay: 1 }).to(".preloader__image img", { opacity: 1, scale: 1, duration: 0.3 }).from(chars, { opacity: 0, y: 20, duration: 0.3, stagger: { amount: 0.3 } }).from(charsMade, { opacity: 0, y: 20, duration: 0.3, stagger: { amount: 0.3 } }).from(charsMade, { opacity: 0, y: 20, duration: 0.4, stagger: { amount: 0.5 }, ease: "power2.in" }, "+=0.2").from(chars, { opacity: 0, y: 20, duration: 0.4, stagger: { amount: 0.5 }, ease: "power2.in" }, "<").to(".preloader__image img", { xPercent: 100, duration: 0.2 }).to(".preloader__image img", { scale: 5, opacity: 0, duration: 0.5 }).to(".preloader", { yPercent: -100, duration: 0.5 });
  return new Promise((resolve) => tl.eventCallback("onComplete", resolve));
}
function removePreloader() {
  const pre = document.querySelector(".preloader");
  if (!pre) return;
  gsapWithCSS.to(pre, { autoAlpha: 0, duration: 0.4, onComplete: () => pre.remove() });
}
function preloaderInit() {
  const pre = document.querySelector(".preloader");
  if (!pre) return;
  const showOnce = !!document.querySelector(ONCE_ATTR);
  const already = localStorage.getItem(ONCE_KEY);
  if (showOnce && already) {
    markLoaded();
    pre.remove();
    return;
  }
  lockScroll();
  markLoading();
  Promise.all([runGsapPreloader(), imagesReadyPromise()]).then(() => {
    if (showOnce) localStorage.setItem(ONCE_KEY, "preloaded");
    markLoaded();
    removePreloader();
  }).catch(() => {
    markLoaded();
    removePreloader();
  });
}
document.addEventListener("DOMContentLoaded", preloaderInit);
