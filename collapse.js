const Collapse = (() => {
  const _instaces = []

  class Collapse {
    constructor(element, config) {
      if (!element || !(element instanceof HTMLElement))
        throw new TypeError('An element must be specified')

      this.el = element
      this._className = element.className

      /*
      this._config = this._getConfig(config)
      */
      
      // Delegated functions
      //this._hide = this.hide.bind(this)
    }

    toggle() {
      this._off('transitionend', this.el)

      if (this.el.classList.contains('show'))
        return this.hide()
      else
        return this.show()
    }

    show() {
      this.el.style.height = 0
      this.el.classList.remove('collapse')
      this.el.classList.add('collapsing')
      this.el.style.height = 0

      this._emit('show')

      return new Promise((resolve, reject) => {
        this._off('transitionend', this.el)
        this._on('transitionend', this.el, () => {
          this._off('transitionend', this.el)

          this.el.classList.remove('collapsing')
          this.el.classList.add('collapse')
          this.el.classList.add('show')
          this.el.style.height = ''

          this._emit('shown')

          resolve(this)
        })._emulateTransitionEnd(this.el, this._getTransitionDurationFromElement(this.el))

        this.el.style.height = `${this.el.scrollHeight}px`
      })
    }

    hide() {
      this.el.style.height = `${this.el.getBoundingClientRect()['height']}px`

      this.el.classList.add('collapsing')
      this.el.classList.remove('collapse')
      this.el.classList.remove('show')

      this._emit('hide')

      // Get duration and reflow
      let d = this._getTransitionDurationFromElement(this.el)

      return new Promise((resolve, reject) => {
        this._off('transitionend', this.el)
        this._on('transitionend', this.el, () => {
          this._off('transitionend', this.el)

          this.el.classList.remove('collapsing')
          this.el.classList.add('collapse')
          this.el.style.height = ''

          this._emit('hidden')

          resolve(this)
        })._emulateTransitionEnd(this.el, d)

        this.el.style.height = ''
      })
    }

    set config(config) {
      this._config = this._getConfig(config)
    }

    _getConfig(config={}) {
      if (config.href) {
        let matches = config.href.match(/^([^#]*)(#[^?]*)?(\?.*)?$/)

        if (matches.length) {
          matches.shift()
          config.selector = matches[1]

          matches.splice(1, 1)
          config.href = matches.filter(a => a || '').join('')
        }
      }

      return config
    }

    _emulateTransitionEnd(element, duration) {
      let called = false
      let transitionend = document.createEvent('Event')
      transitionend.initEvent('transitionend', true, true)

      element.addEventListener('transitionend', function once() {
        element.removeEventListener('transitionend', once)
        called = true
      })

      setTimeout(() => {
        element.dispatchEvent(transitionend)
      }, duration)

      return this
    }

    _getTransitionDurationFromElement(element) {
      if (!element) return 0;

      // Get transition-duration of the element
      let transitionDuration = window.getComputedStyle(element)['transition-duration']
      const floatTransitionDuration = parseFloat(transitionDuration)

      // Return 0 if element or transition duration is not found
      if (!floatTransitionDuration) return 0;

      // If multiple durations are defined, take the first
      transitionDuration = transitionDuration.split(',')[0]

      return parseFloat(transitionDuration) * 1000
    }

    _emit(type) {
      let event = document.createEvent('Event')
      event.initEvent(type, true, true)

      this.el.dispatchEvent(event)
    }

    _on(event, el, func) {
      el._e = el._e || {}
      el._e[event] = el._e[event] || []

      el.addEventListener(event, func)
      el._e[event].push(func)

      return this
    }

    _off(event, el) {
      if (!el || !el._e || !el._e[event]) return this;

      el._e[event].forEach(f => {
        el.removeEventListener(event, f)
      })

      delete el._e[event]

      return this
    }

    dispose() {
      this._off('transitionend', this.el)
      this.el.className = this._className
      this.el.style.height = ''

      this.el = null

      return this
    }

    static instance(element) {
      return element._collapse
    }

    static get instances() {
      return _instaces
    }

    static create(element, config) {
      let collapse = element._collapse || new Collapse(element, config) 

      if (!element._collapse) {
        element._collapse = collapse
        _instaces.push(collapse)
      } else
        collapse.config = config

      return collapse.toggle()
    }

    static dispose() {
      _instaces.forEach(instance => {
        delete instance.el._collapse
        instance.dispose()
      })
      _instaces.splice(0, _instaces.length)
    }
  }

  // Click handler
  document.addEventListener('click', e => {
    Array.from(e.currentTarget.querySelectorAll('[data-toggle="collapse"]')).forEach(el => {
      // The target
      if (e.target == el || el.contains(e.target)) {
        let config = {}
        let selector = el.getAttribute('data-target') && '#' + el.getAttribute('data-target')
        let targets = []

        if (selector) {
          targets = Array.from(document.querySelectorAll(selector))
        } else if (el.nextElementSibling.classList.contains('collapse')) {
          targets = [el.nextElementSibling]
        }

        // Kill anchor default behavior
        if (el.tagName === 'A' || el.tagName === 'AREA') {
          e.preventDefault()
        }

        // Create Collapse
        targets.forEach(el => Collapse.create(el, config))
      }
    })
  })

  return Collapse
})()

// Export it for webpack
if (typeof module === 'object' && module.exports) {
  module.exports = { Collapse: Collapse };
}
