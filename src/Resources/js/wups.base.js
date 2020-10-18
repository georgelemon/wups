/**
 * Going fully Vanilla JS without dependencies
 * @since wups
 */
let header             = document.querySelector('header');
let messageContainer   = document.querySelector('.exception');
let leftPanel          = document.querySelector('.left-panel');
let frameContainer     = document.querySelector('.frames-container');
let appFramesTab       = document.getElementById('application-frames-tab');
let allFramesTab       = document.getElementById('all-frames-tab');
let container          = document.querySelector('.details-container');
let activeLine         = frameContainer.querySelector('.frame.active');
let frameFiles         = frameContainer.querySelectorAll('.frame');
let activeFrame        = container.querySelector('.frame-code.active');
let ajaxEditors        = document.querySelector('.editor-link[data-ajax]');


    header.addEventListener('mouseenter', e => {
        if( messageContainer.offsetHeight >= 140 ) {
            header.classList.add('header-expand');
        }
    });
    header.addEventListener('mouseleave', e => {
        header.classList.remove('header-expand');
    });

  /*
   * add prettyprint classes to our current active codeblock
   * run prettyPrint() to highlight the active code
   * scroll to the line when prettyprint is done
   * highlight the current line
   */
  var renderCurrentCodeblock = function(id) {

        // remove previous codeblocks so we only render the active one
        document.querySelector('.code-block').classList.remove('prettyprint');

        // pass the id in when we can for speed
        if (typeof(id) === 'undefined' || typeof(id) === 'object') {
          var id = /frame\-line\-([\d]*)/.exec(activeLine.getAttribute('id'))[1];
        }

        // Prettify current code frame
        document.getElementById('frame-code-linenums-' + id).classList.add('prettyprint');

        // Get the Code Arguments container when available
        if( codeArgsContainer =  document.getElementById('frame-code-args-' + id ) ) {
            codeArgsContainer.classList.add('prettyprint');
        }

        prettyPrint(highlightCurrentLine);

    }

    /*
     * Highlight the active and neighboring lines for the current frame
     * Adjust the offset to make sure that line is veritcally centered
     */
    var highlightCurrentLine = function() {

        // get the current code block view
        let currentBlock     = activeFrame.querySelector('.code-block');

        // get the current line from stack
        let activeLineNumber = activeLine.querySelector('.frame-line').textContent;

        // get all lines from current code block
        let lines            = activeFrame.querySelectorAll('.linenums li');

        // get the first line of the 
        let firstLine        = lines[0].getAttribute('value');

        // We show more code than needed, purely for proper syntax highlighting
        // Let’s hide a big chunk of that code and then scroll the remaining block
        currentBlock.style.cssText = 'max-height:345px;overflow:hidden;';

        // offset scroll view
        let offset = lines[activeLineNumber - firstLine - 10];

        // Scroll Content View
        // @see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
        if (offset.textContent.length > 0) {
            offset.scrollIntoView();
        }

        /**
         * Highlight lines
         */
        lines[activeLineNumber - firstLine - 1].classList.add('current');
        lines[activeLineNumber - firstLine].classList.add('current', 'active');
        lines[activeLineNumber - firstLine + 1].classList.add('current');
        
        container.scrollTop = 0; // force scroll top

    }

    /**
     * Parse Stack Frames Sidebar
     */
    frameFiles.forEach(function(item) {

        item.addEventListener('click', function(event) {
            
            let target = event.currentTarget;
            let id = /frame\-line\-([\d]*)/.exec(target.getAttribute('id'))[1];

            if (codeFrame = document.getElementById('frame-code-' + id)) {

                // remove active class
                activeLine.classList.remove('active');
                activeFrame.classList.remove('active');

                // set active the current container 
                target.classList.add('active');
                codeFrame.classList.add('active');

                activeLine  = target;
                activeFrame = codeFrame;
                renderCurrentCodeblock(id);
            }

        });
    });

    /**
     * Clipboard Plugin
     */
    function fallbackMessage(action) {
        var actionMsg = '';
        var actionKey = (action === 'cut' ? 'X' : 'C');

        if (/Mac/i.test(navigator.userAgent)) {
            actionMsg = 'Press ⌘-' + actionKey + ' to ' + action;
        } else {
            actionMsg = 'Press Ctrl-' + actionKey + ' to ' + action;
        }

        return actionMsg;
    }

    let clipboard = new Clipboard('.clipboard');
    let showTooltip = function(elem, msg) {
        elem.setAttribute('class', 'clipboard tooltipped tooltipped-s');
        elem.setAttribute('aria-label', msg);
    };

    clipboard.on('success', function(e) {
        e.clearSelection();
        showTooltip(e.trigger, 'Copied!');
    });

    clipboard.on('error', function(e) {
        showTooltip(e.trigger, fallbackMessage(e.action));
    });
    
    document.querySelector('.clipboard').addEventListener('mouseleave', function(e) {
        e.currentTarget.classList.add('clipboard');
        e.currentTarget.removeAttribute('aria-label');
    });    


Zepto(function($) {
  // var $leftPanel      = $('.left-panel');
  var $frameContainer = $('.frames-container');
  var $appFramesTab   = $('#application-frames-tab');
  var $allFramesTab   = $('#all-frames-tab');
  var $container      = $('.details-container');
  var $activeLine     = $frameContainer.find('.frame.active');
  var $activeFrame    = $container.find('.frame-code.active');
  var $ajaxEditors    = $('.editor-link[data-ajax]');

  $(document).on('keydown', function(e) {
    var applicationFrames = $frameContainer.hasClass('frames-container-application'),
        frameClass = applicationFrames ? '.frame.frame-application' : '.frame';

	  if(e.ctrlKey || e.which === 74  || e.which === 75) {
		  // CTRL+Arrow-UP/k and Arrow-Down/j support:
		  // 1) select the next/prev element
		  // 2) make sure the newly selected element is within the view-scope
		  // 3) focus the (right) container, so arrow-up/down (without ctrl) scroll the details
		  if (e.which === 38 /* arrow up */ || e.which === 75 /* k */) {
			  $activeLine.prev(frameClass).click();
			  scrollIntoView($activeLine, leftPanel);
			  $container.focus();
			  e.preventDefault();
		  } else if (e.which === 40 /* arrow down */ || e.which === 74 /* j */) {
			  $activeLine.next(frameClass).click();
			  scrollIntoView($activeLine, leftPanel);
			  $container.focus();
			  e.preventDefault();
		  }
	  } else if (e.which == 78 /* n */) {
      if ($appFramesTab.length) {
        setActiveFramesTab($('.frames-tab:not(.frames-tab-active)'));
      }
    }
  });

  // Render late enough for highlightCurrentLine to be ready
  renderCurrentCodeblock();

  // Avoid to quit the page with some protocol (e.g. IntelliJ Platform REST API)
  $ajaxEditors.on('click', function(e){
    e.preventDefault();
    $.get(this.href);
  });

  // Symfony VarDumper: Close the by default expanded objects
  $('.sf-dump-expanded')
    .removeClass('sf-dump-expanded')
    .addClass('sf-dump-compact');
  $('.sf-dump-toggle span').html('&#9654;');

  // Make the given frames-tab active
  function setActiveFramesTab($tab) {
    $tab.addClass('frames-tab-active');

    if ($tab.attr('id') == 'application-frames-tab') {
      $frameContainer.addClass('frames-container-application');
      $allFramesTab.removeClass('frames-tab-active');
    } else {
      $frameContainer.removeClass('frames-container-application');
      $appFramesTab.removeClass('frames-tab-active');
    }
  }

  $('a.frames-tab').on('click', function(e) {
    e.preventDefault();
    setActiveFramesTab($(this));
  });
});
