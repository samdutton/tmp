Hold It!

Automatically pause video that's not visible. 

For example, when you:
- minimise a window with a video playing in it
- move to a different tab
- open a video link in a different tab.

Useful when opening lots of YouTube links in new tabs!

.......................


How to use the extension

After installing the extension, any playing video will be paused when you move to a different tab, minimise a window -- or if you open a link to a page with a video on it in a new tab 


How does it work?

This extension uses the Page Visibility API.

The API can be used to check when a web page is visible to the user or not.

If you minimise your browser window, or move to another tab, JavaScript detects a webkitvisibilitychange event. 

When a new page loads, the extension looks for videos on the page -- including HTML video, and Flash videos on sites like YouTube and Vimeo. If the page is not visible, or becomes hidden, all playing videos on the page are paused. Play restarts (for videos that were playing) once they become visible again. 


Feedback

Please send bug reports, comments or feature requests to samdutton@gmail.com.

For more information, please visit my website samdutton.com or my blog at samdutton.wordpress.com.

