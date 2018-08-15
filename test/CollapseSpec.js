describe('Collapse', function() {
  // Events
  let _click = document.createEvent('Event')
  _click.initEvent('click', true, true)

  const events = {
    click: _click
  }

  let triggers = document.querySelectorAll('[data-toggle="collapse"]')

  describe('Initialize', function() {
    it('No Element', function(done) {
      try {
        new Collapse()
      } catch (e) {
        expect(e.message).toBe('An element must be specified')
        done()
      }
    })
  })

  describe('Show', function() {
    it('No animation', function(done) {
      let c = new Collapse(document.getElementById('collapse-1'))

      expect(c.el).toEqual(document.getElementById('collapse-1'))
      expect(document.getElementById('collapse-1').getAttribute('aria-expanded')).toBeNull()

      c.el.addEventListener('show', function() {
        expect(c.el.style.height).toBe('0px')
        expect(c.el.classList.contains('collapsing')).toBeTruthy()
        expect(c.el.classList.contains('collapse')).toBeFalsy()

        expect(c._getTransitionDurationFromElement(c.el)).toEqual(0)
      }, {once:true})


      c.el.addEventListener('shown', function() {
        expect(Number(window.getComputedStyle(c.el).height.replace('px', ''))).toBeGreaterThan(0)
        expect(Number(window.getComputedStyle(c.el).height.replace('px', ''))).toEqual(c.el.scrollHeight)
        expect(c.el.classList.contains('show')).toBeTruthy()

        c.dispose()

        done()
      }, {once:true})

      c.show()
    })

    it('With animation', function(done) {
      let c = new Collapse(document.getElementById('collapse-2'))

      c.el.addEventListener('show', function() {
        expect(c.el.style.height).toBe('0px')
        expect(c.el.classList.contains('collapsing')).toBeTruthy()
        expect(c.el.classList.contains('collapse')).toBeFalsy()
      }, {once:true})

      setTimeout(() => {
        expect(Number(c.el.style.height.replace('px', ''))).toBeGreaterThan(0)
        expect(Number(window.getComputedStyle(c.el).height.replace('px', ''))).toBeGreaterThan(0)
        expect(Number(window.getComputedStyle(c.el).height.replace('px', ''))).toBeLessThan(c.el.scrollHeight)

        expect(c._getTransitionDurationFromElement(c.el)).toEqual(700)
      }, 100)

      c.el.addEventListener('shown', function() {
        expect(Number(window.getComputedStyle(c.el).height.replace('px', ''))).toBeGreaterThan(0)
        expect(Number(window.getComputedStyle(c.el).height.replace('px', ''))).toEqual(c.el.scrollHeight)

        expect(c.el.classList.contains('show')).toBeTruthy()

        c.dispose()

        done()
      }, {once:true})

      c.show()
    })
  })

  describe('Hide', function() {
    it('With animation', function(done) {
      let c = new Collapse(document.getElementById('collapse-2'))

      c.show().then(() => {
        c.el.addEventListener('hide', () => {
          expect(c.el.classList.contains('show')).toBeFalsy()
          expect(c.el.classList.contains('collapsing')).toBeTruthy()
          expect(Number(c.el.style.height.replace('px', ''))).toEqual(c.el.scrollHeight)
        }, {once: true})

        c.hide()

        setTimeout(() => {
          expect(isNaN(Number(window.getComputedStyle(c.el).height.replace('px', '')))).toBeFalsy()
          expect(Number(window.getComputedStyle(c.el).height.replace('px', ''))).toBeGreaterThan(0)
          expect(Number(window.getComputedStyle(c.el).height.replace('px', ''))).toBeLessThan(c.el.scrollHeight)

          expect(c._getTransitionDurationFromElement(c.el)).toEqual(700)
        }, 100)

        c.el.addEventListener('hidden', () => {
          expect(c.el.classList.contains('collapsing')).toBeFalsy()
          expect(Number(c.el.style.height.replace('px', ''))).toEqual(0)

          c.dispose()

          done()
        }, {once: true})
      })
    })
  })

  describe('Toggle', function() {
    it('Toggle', function(done) {
      let c = new Collapse(document.getElementById('collapse-2'))

      expect(c.el.classList.contains('show')).toBeFalsy()

      c.toggle().then(() => {
        expect(Number(window.getComputedStyle(c.el).height.replace('px', ''))).toBeGreaterThan(0)

        c.el.addEventListener('hidden', () => {
          expect(c.el.classList.contains('collapse')).toBeTruthy()

          c.dispose()

          done()
        }, {once: true})

        setTimeout(() => {
          expect(Number(window.getComputedStyle(c.el).height.replace('px', ''))).toBeGreaterThan(0)
        }, 100)

        c.toggle()
      })
    })
  })

  describe('DOM Interface', function() {
    it('With target', function(done) {
      triggers[0].dispatchEvent(events.click)

      let c = Collapse.instance(document.getElementById('collapse-2'))

      expect(c instanceof Collapse).toBeTruthy()

      c.el.addEventListener('hidden', () => {
        expect(triggers[0].getAttribute('aria-expanded')).toBeNull()

        Collapse.dispose()

        done()
      }, {once:true})

      c.el.addEventListener('shown', () => {
        expect(triggers[0].getAttribute('aria-expanded')).toBe('true')
        triggers[0].dispatchEvent(events.click)
      }, {once:true})
    })

    it('Without target', function(done) {
      triggers[1].dispatchEvent(events.click)

      let c = Collapse.instance(document.getElementById('collapse-2'))

      expect(c instanceof Collapse).toBeTruthy()

      c.el.addEventListener('hidden', () => {
        Collapse.dispose()

        done()
      }, {once:true})

      c.el.addEventListener('shown', () => {
        triggers[0].dispatchEvent(events.click)
      }, {once:true})
    })
  })
})
