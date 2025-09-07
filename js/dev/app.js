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
    const matchMedia = window.matchMedia(mediaQuery);
    const itemsArray = media.filter((item) => item.value === mediaBreakpoint && item.type === mediaType);
    return { itemsArray, matchMedia };
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
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
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
  var html = getDocumentElement(element2);
  var visualViewport = win.visualViewport;
  var width = html.clientWidth;
  var height = html.clientHeight;
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
  var html = getDocumentElement(element2);
  var winScroll = getWindowScroll(element2);
  var body = (_element$ownerDocumen = element2.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
  var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
  var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
  var x = -winScroll.scrollLeft + getWindowScrollBarX(element2);
  var y = -winScroll.scrollTop;
  if (getComputedStyle$1(body || html).direction === "rtl") {
    x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
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
function dangerouslySetInnerHTML(element2, html) {
  element2[innerHTML()] = html;
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
    if (!src) return "<div>Видео не задано</div>";
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
    if (!src) return "<div>Картинка не задана</div>";
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
  if (spollersArray.length > 0) {
    let initSpollers2 = function(spollersArray2, matchMedia = false) {
      spollersArray2.forEach((spollersBlock) => {
        spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
        if (matchMedia.matches || !matchMedia) {
          spollersBlock.classList.add("--spoller-init");
          initSpollerBody2(spollersBlock);
        } else {
          spollersBlock.classList.remove("--spoller-init");
          initSpollerBody2(spollersBlock, false);
        }
      });
    }, initSpollerBody2 = function(spollersBlock, hideSpollerBody = true) {
      let spollerItems = spollersBlock.querySelectorAll("details");
      if (spollerItems.length) {
        spollerItems.forEach((spollerItem) => {
          let spollerTitle = spollerItem.querySelector("summary");
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
    }, setSpollerAction2 = function(e) {
      const el = e.target;
      if (el.closest("summary") && el.closest("[data-fls-spollers]")) {
        e.preventDefault();
        if (el.closest("[data-fls-spollers]").classList.contains("--spoller-init")) {
          const spollerTitle = el.closest("summary");
          const spollerBlock = spollerTitle.closest("details");
          const spollersBlock = spollerTitle.closest("[data-fls-spollers]");
          const oneSpoller = spollersBlock.hasAttribute("data-fls-spollers-one");
          const scrollSpoller = spollerBlock.hasAttribute("data-fls-spollers-scroll");
          const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
          if (!spollersBlock.querySelectorAll(".--slide").length) {
            if (oneSpoller && !spollerBlock.open) {
              hideSpollersBody2(spollersBlock);
            }
            !spollerBlock.open ? spollerBlock.open = true : setTimeout(() => {
              spollerBlock.open = false;
            }, spollerSpeed);
            spollerTitle.classList.toggle("--spoller-active");
            slideToggle(spollerTitle.nextElementSibling, spollerSpeed);
            if (scrollSpoller && spollerTitle.classList.contains("--spoller-active")) {
              const scrollSpollerValue = spollerBlock.dataset.flsSpollersScroll;
              const scrollSpollerOffset = +scrollSpollerValue ? +scrollSpollerValue : 0;
              const scrollSpollerNoHeader = spollerBlock.hasAttribute("data-fls-spollers-scroll-noheader") ? document.querySelector(".header").offsetHeight : 0;
              window.scrollTo(
                {
                  top: spollerBlock.offsetTop - (scrollSpollerOffset + scrollSpollerNoHeader),
                  behavior: "smooth"
                }
              );
            }
          }
        }
      }
      if (!el.closest("[data-fls-spollers]")) {
        const spollersClose = document.querySelectorAll("[data-fls-spollers-close]");
        if (spollersClose.length) {
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
    }, hideSpollersBody2 = function(spollersBlock) {
      const spollerActiveBlock = spollersBlock.querySelector("details[open]");
      if (spollerActiveBlock && !spollersBlock.querySelectorAll(".--slide").length) {
        const spollerActiveTitle = spollerActiveBlock.querySelector("summary");
        const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
        spollerActiveTitle.classList.remove("--spoller-active");
        slideUp(spollerActiveTitle.nextElementSibling, spollerSpeed);
        setTimeout(() => {
          spollerActiveBlock.open = false;
        }, spollerSpeed);
      }
    };
    var initSpollers = initSpollers2, initSpollerBody = initSpollerBody2, setSpollerAction = setSpollerAction2, hideSpollersBody = hideSpollersBody2;
    document.addEventListener("click", setSpollerAction2);
    const spollersRegular = Array.from(spollersArray).filter(function(item, index, self) {
      return !item.dataset.flsSpollers.split(",")[0];
    });
    if (spollersRegular.length) {
      initSpollers2(spollersRegular);
    }
    let mdQueriesArray = dataMediaQueries(spollersArray, "flsSpollers");
    if (mdQueriesArray && mdQueriesArray.length) {
      mdQueriesArray.forEach((mdQueriesItem) => {
        mdQueriesItem.matchMedia.addEventListener("change", function() {
          initSpollers2(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
        });
        initSpollers2(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
      });
    }
  }
}
window.addEventListener("load", spollers);
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
window.addEventListener("load", initCatalogToggle);
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
  c(html) {
    this.h(html);
  }
  /**
   * @param {string} html
   * @param {HTMLElement | SVGElement} target
   * @param {HTMLElement | SVGElement} anchor
   * @returns {void}
   */
  m(html, target, anchor = null) {
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
      this.c(html);
    }
    this.i(anchor);
  }
  /**
   * @param {string} html
   * @returns {void}
   */
  h(html) {
    this.e.innerHTML = html;
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
  p(html) {
    this.d();
    this.h(html);
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
function create_custom_element(Component, props_definition, slots, accessors, use_shadow_dom, extend) {
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
  function set(new_value) {
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
    set(fn2(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start2(set, update2) || noop;
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
  return { set, update: update2, subscribe: subscribe2 };
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
  function set(new_value, opts2 = {}) {
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
    set,
    update: (fn2, opts2) => set(fn2(target_value, value), opts2),
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
      resizeObserver = new ResizeObserver((entries) => {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        rafId = updateSliderSize(entries[0].target);
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
document.addEventListener("DOMContentLoaded", () => {
  const ICONS = {
    1: { label: "basic", img: "/assets/img/usefulness/signal-one.svg" },
    2: { label: "easy", img: "/assets/img/usefulness/signal-two.svg" },
    3: { label: "medium", img: "/assets/img/usefulness/signal-three.svg" },
    4: { label: "hard", img: "/assets/img/usefulness/signal-four.svg" },
    5: { label: "master", img: "/assets/img/usefulness/signal-five.svg" }
  };
  const safe = (s) => String(s).replace(/"/g, "").trim();
  const iconPipFormatter = (v) => {
    const it = ICONS[v];
    return it ? `<div class="pipIcon"><img src="${safe(it.img)}" alt="${it.label}"></div>` : String(v);
  };
  const iconHandleFormatter = (v) => {
    const it = ICONS[v];
    return it ? `<img src="${safe(it.img)}" alt="${it.label}">` : String(v);
  };
  const targetIcons = document.querySelector("#range-slider-icons");
  const targetLabels = document.querySelector("#range-slider-labels");
  if (!targetIcons || !targetLabels) {
    console.warn("[rangetest] targets not found");
    return;
  }
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
  const labelHandleFormatter = (v) => String(v);
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
      handleFormatter: labelHandleFormatter,
      hoverable: true
    }
  });
  let uRange = [1, 5];
  let dRange = [1, 5];
  const WORD2NUM = { one: 1, two: 2, three: 3, four: 4, five: 5 };
  const DIFF2NUM = { basic: 1, easy: 2, medium: 3, hard: 4, master: 5 };
  const clampRange = (arr) => {
    let [a, b] = Array.isArray(arr) ? arr : [arr, arr];
    a = Number(a);
    b = Number(b);
    if (a > b) [a, b] = [b, a];
    return [a, b];
  };
  const inRange = (v, [min2, max2]) => v >= min2 && v <= max2;
  function parseUsefulness(item) {
    const img = item.querySelector("[data-usefulness]");
    if (!img) return null;
    const raw = img.getAttribute("data-usefulness") || "";
    const word = raw.split("-").pop();
    return WORD2NUM[word] ?? null;
  }
  function parseDifficulty(item) {
    const el = item.querySelector("[data-difficulty]");
    if (!el) return null;
    const raw = (el.getAttribute("data-difficulty") || "").toLowerCase();
    return DIFF2NUM[raw] ?? null;
  }
  function updateEmptyStatesPerItem() {
    document.querySelectorAll(".spoller-block__item").forEach((block) => {
      const visible = block.querySelectorAll(".spoller-block__link-item:not(.is-hidden)").length;
      const isEmpty = visible === 0;
      block.classList.toggle("is-empty", isEmpty);
      const details = block.querySelector("details");
      if (details && isEmpty) details.open = false;
    });
  }
  function updateEmptyStatesPerGroup() {
    document.querySelectorAll(".catalog__spoller-block").forEach((group) => {
      const nonEmptyItems = group.querySelectorAll(".spoller-block__item:not(.is-empty)").length;
      const isGroupEmpty = nonEmptyItems === 0;
      group.classList.toggle("is-empty", isGroupEmpty);
    });
  }
  function applyFilter() {
    const items = document.querySelectorAll(".spoller-block__link-item");
    items.forEach((item) => {
      const u = parseUsefulness(item);
      const d = parseDifficulty(item);
      const passU = u != null ? inRange(u, uRange) : false;
      const passD = d != null ? inRange(d, dRange) : false;
      const show = passU && passD;
      item.classList.toggle("is-hidden", !show);
    });
    updateEmptyStatesPerItem();
    updateEmptyStatesPerGroup();
  }
  const getVals = (e) => {
    const detail = e?.detail;
    if (!detail) return [1, 5];
    if (Array.isArray(detail.values)) return detail.values;
    if (Array.isArray(detail)) return detail;
    if (typeof detail.value === "number") return [detail.value, detail.value];
    return [1, 5];
  };
  sliderIcons.$on("input", (e) => {
    uRange = clampRange(getVals(e));
    applyFilter();
  });
  sliderIcons.$on("change", (e) => {
    uRange = clampRange(getVals(e));
    applyFilter();
  });
  sliderLabels.$on("input", (e) => {
    dRange = clampRange(getVals(e));
    applyFilter();
  });
  sliderLabels.$on("change", (e) => {
    dRange = clampRange(getVals(e));
    applyFilter();
  });
  applyFilter();
});
