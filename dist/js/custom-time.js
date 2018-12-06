/**
 * CustomTime v1.0.3 (https://github.com/deviscoding/custom-time)
 * @author  AMJones [am@jonesiscoding.com]
 * @licence MIT (https://github.com/deviscoding/custom-time/blob/master/LICENSE)
 */
;(function($) {

  $.customtime = function(el, options) {
    var defaults = { cls: { h: 'custom-time-h', i: 'custom-time-i', s: 'custom-time-s', a: 'custom-time-a' }};
    var ct = this;

    var _min = null;
    var _max = null;
    var _step = null;
    var _faux = null;

    /** @type {jQuery} ct.$input */
    ct.$input   = $( el );
    /** @type {jQuery} ct.$wrapper */
    ct.$wrapper = ct.$input.parent();

    ct.min = function(part) {
      if(_min === null) { _min =  parseTime(ct.$input.attr('min') || '00:00:00', true); }

      return (part) ? _min[part] || null : _min;
    };

    ct.max = function(part) {
      if(_max === null) { _max =  parseTime(ct.$input.attr('max') || '23:59:59', true); }

      return (part) ? _max[part] || null : _max;
    };

    ct.step = function(key) {
      if(_step === null) {
        var s = parseInt(ct.$input.attr('step')) || 60;
        _step = { h: 1, i: 1, s: 1 };
        if(s >= 3600) {
          _step.h = Math.floor(s/3600);
        } else if(s < 60) {
          _step.s = s;
        } else {
          _step.i = Math.floor(s/60);
        }
      }

      return (key) ? _step[key] || null : _step;
    };

    ct.update = function() {
      if(ct.$input.val() != ct.value) {
        ct.value = ct.$input.val();
        if(ct.value.length) {
          var t = parseTime(ct.value);
          ct.$hour.val( pad( t.h ) );
          ct.$min.val( pad( t.i ) );
          ct.$sec.val( pad( t.s ) );
          ct.$cnv.val( t.a );
        }
      } else {
        var a  = ct.$cnv.val();
        var h  = ct.$hour.val() || null;
        var i  = ( ct.settings.widgets.i ) ? ct.$min.val() : '00';
        var s  = ( ct.settings.widgets.s ) ? ct.$sec.val() : null;

        if ( a.length && i.length && (h && h.length) ) {
          if(12 == h) { h = "0"; }
          if ( 'am' !== a ) {
            var hh = 12 + parseInt(h,10);
            h = (hh === 24 && hh > 0) ? "0" : hh.toString();
          }

          _faux = [pad(h),pad(i)];
          if ( ct.settings.widgets.s ) {
            _faux.push( pad( s ) );
          }

          ct.value = _faux.join(':');
          ct.$input.val( ct.value );
        }
      }
    };

    var parseTime = function(val, minmax) {
      var s = val.split(':');
      var h = parseInt(s[0]);
      var a = 'am';

      if(h >= 12) {
        h = (minmax || h === 12) ? 12 : h - 12;
        a = 'pm';
      } else if(minmax && 0 === h) {
        h = 1;
      }

      return {
        h: h,
        i: parseInt((s.length > 1) ? s[1] : 0),
        s: parseInt((s.length > 2) ? s[2] : 0),
        a: a
      };
    };

    var init = function() {
      ct.settings = $.extend( {}, defaults, options );
      ct.settings.step = ct.$input.attr('step') || 60;
      ct.settings.widgets = ct.settings.widgets || { h: true, i: (ct.settings.step < 3600), s: (ct.settings.step < 60), a: true };

      ct.$hour = getSelect( 'h' ).on( 'change blur', ct.update );
      ct.$min  = getSelect( 'i' ).on( 'change blur', ct.update );
      ct.$sec  = getSelect( 's' ).on( 'change blur', ct.update );
      ct.$cnv  = getSelect( 'a' ).on( 'change blur', ct.update );
      ct.$input.on('change blur', ct.update);

      ct.update();
    };

    /**
     * @param key
     * @returns {jQuery}
     */
    var getSelect = function ( key ) {
      var $sel = ct.$input.siblings( '.' + ct.settings.cls[ key ] );
      if ( !$sel.length ) {
        if(key === 'a') {
          $sel = $( '<select><option value="">--</option><option value="am">AM</option><option value="pm">PM</option></select>' );
        } else {
          $sel = makeSelect( { min:  ct.min( key ), max:  ct.max( key ), step: ct.step( key ) } );
        }
      }

      if ( ct.settings.widgets[ key ] ) {
        $sel.addClass( ct.settings.cls[ key ] ).appendTo( ct.$wrapper );
      }

      return $sel;
    };

    /**
     * @param {object} options
     * @returns {jQuery}
     */
    var makeSelect = function(options) {
      var option = '<option value="#">#</option>';
      var $sel = $('<select></select>');
      $sel.append(option.replace(/#/g,'--'));
      for(var x = options.min || 0; x <= options.max; x = x + options.step) {
        var val = (x < 10) ? '0' + x : x;
        $sel.append(option.replace(/#/g,val));
      }

      return $sel;
    };

    /**
     * @param {string|int} val
     * @returns {string}
     */
    var pad = function(val) {
      if(val === 0 || val === null) {
        return "00";
      } else {
        var str = val.toString();

        return (str.length < 2) ? "0" + str.toString() : str;
      }
    };

    init();
  };

  $.fn.customtime = function(options) {
    return this.each(function() {
      if (undefined === $(this).data('custom_time')) {
        var plugin = new $.customtime(this, options);
        $(this).data('custom_time', plugin);
      }
    });
  }
})(jQuery);