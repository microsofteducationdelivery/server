(function () {
    'use strict';

    var mediaData = new WinJS.Binding.List(),
        currentId,
        buffer = {}
    ;

    WinJS.UI.Pages.define('/resources/pages/edit-library.html', {
        ready: function (element, options) {
            var listView = WinJS.Utilities.query('div[data-win-control="WinJS.UI.ListView"]', element);

            WinJS.Utilities.query('button[id=path-back-btn]').listen('click', function () {
                var link = WinJS.Utilities.query('div[class=b-library-path]', element)[0].lastChild;
                getFolderData(link.id);
            });

            WinJS.Utilities.query('button[class=b-library-new-folder-btn]').listen('click', function () {

                window.showPopup('/resources/pages/popups/add-new-folder.html', {});
            });
            WinJS.Utilities.query('button[class=b-library-new-media-btn]').listen('click', function () {
                window.showPopup('/resources/pages/popups/add-new-media.html', {libraryId: options.id});
            });

            WinJS.Utilities.query('button[class=b-libraries__cut-button]', element).listen('click', function () {
                buffer.data = getSelection();
                if (buffer.data.length === 0) {
                    return false;
                }
                var boxes = WinJS.Utilities.query('input[type=checkbox]');
                boxes.forEach(function (item) {
                    item.parentNode.parentNode.parentElement.setAttribute('class', 'b_media-list-tpl--item');
                });

                boxes = WinJS.Utilities.query('input[type=checkbox]:checked');

                boxes.forEach(function (item) {
                    item.parentNode.parentNode.parentElement.setAttribute('class', 'b_media-list-tpl--item-cut');
                });
                buffer.type = 'move';
            });
            WinJS.Utilities.query('button[class=b-libraries__delete-button]', element).listen('click', function () {
                buffer.data = getSelection();

                if (buffer.data.length === 0) {
                    return false;
                }
                window.showPopup('/resources/pages/popups/delete-confirm.html', {callback: function () {
                    WinJS.xhr({
                        url: '/removeLibrary',
                        type: 'DELETE',
                        data: buffer.data
                    }).done(function (result) {
                        if (result.status === 200) {
                            getFolderData(currentId);
                        }
                    });
                }});

            });
            WinJS.Utilities.query('button[class=b-libraries__copy-button]', element).listen('click', function () {
                buffer.data = getSelection();
                buffer.type = 'copy';
            });
            WinJS.Utilities.query('button[class=b-libraries__paste-button]', element).listen('click', function () {
                if (buffer.length === 0) {
                    return false;
                }
                WinJS.xhr({
                    url: '/' + buffer.type + 'Library',
                    type: 'PUT',
                    data: buffer.data
                }).done(function (result) {
                    if (result.status === 200) {
                        getFolderData(currentId);
                        var boxes = WinJS.Utilities.query('input[type=checkbox]');
                        boxes.forEach(function (item) {
                            item.parentNode.parentNode.setAttribute('class', 'b_media-list-tpl--item');
                        });
                    }

                });
            });

            WinJS.Utilities.query('button[class=b-libraries__save-button]', element).listen('click', function () {
                var form = element.querySelector('form'),
                    data = {
                        type: form.type.value,
                        name: form.name.value,
                        file: form.file.value,
                        link: form.link.value,
                        id: form.id
                    };

                WinJS.xhr({
                    url: '/saveMedia' + data.id + '',
                    type: 'PUT',
                    data: data
                }).done(function (result) {
                    console.log(result.status);
                    if (result.status !== 200) {
                        return null;
                    }
                    setMediaForm(data.id);
                });
            });
            WinJS.Utilities.query('button[class=b-libraries__cancel-button]', element).listen('click', function () {
                setMediaForm(element.querySelector('form').id);
            });
            listView.listen('click', function (event) {
                event.stopPropagation();
                var currTarget = event.target,
                    listItem = currTarget
                ;

                if (currTarget.className === 'b_body-box') {
                    var input = currTarget.parentNode.querySelector('input');
                    setBntDisable(getSelection().length !== 0);
                    event.preventDefault();
                    input.checked = !input.checked;

                } else if (currTarget.className === 'b_media-list-tpl--item__edit'
                    || currTarget.className === 'fa fa-pencil') {

                    while (listItem.className !== 'b_media-list-tpl--item') {
                        listItem = listItem.parentNode;
                    }

                    var id = listItem.querySelector('input[type=checkbox]').name,
                        name = listItem.parentNode.querySelector('h3').innerHTML
                    ;

                    window.showPopup('/resources/pages/popups/edit-folder.html', {id: id, name: name});
                    event.preventDefault();
                } else {
                    while (listItem.classList[0] !== 'b_media-list-tpl--item') {
                        listItem = listItem.parentNode;
                        if (!listItem.classList) {

                            return;
                        }
                    }
                    var itemId = listItem.querySelector('input[type=checkbox]').name,
                        item = listItem,
                        mediaItems = WinJS.Utilities.query('div[class="b_media-list-tpl--item b_current-media"]'),
                        target = listItem.querySelector('div[class=b_media-list-tpl--item__edit]'),
                        type = target.style
                    ;

                    for (var i = 0; i < mediaItems.length; i ++) {
                        mediaItems[i].setAttribute('class', 'b_media-list-tpl--item');
                    }

                    if (type.display === 'none') {
                        WinJS.Utilities.query('div[id=media_edit]')[0].className = 'b-library-edit';
                        if (item) {
                            item.setAttribute('class', 'b_media-list-tpl--item b_current-media');
                        }
                        setMediaForm(itemId);
                    } else {
                        WinJS.Utilities.query('div[id=media_edit]')[0].className = 'b-library-edit hidden';
                        getFolderData(itemId);
                    }
                    event.preventDefault();
                }

            });


            WinJS.UI.processAll(element);
            getFolderData(options.id);

        }
    });
    function setBntDisable (disabled) {
        WinJS.Utilities.query('button[class=b-libraries__cut-button]')[0].disabled = disabled;
        WinJS.Utilities.query('button[class=b-libraries__delete-button]')[0].disabled = disabled;
        WinJS.Utilities.query('button[class=b-libraries__copy-button]')[0].disabled = disabled;
        WinJS.Utilities.query('button[class=b-libraries__paste-button]')[0].disabled = disabled;
    }
    function setMediaForm (id) {
        WinJS.xhr({
            url: '/listData/media_' + id + '.json',
            type: 'GET'
        }).done(function (result) {
            if (result.status !== 200) {
                return null;
            }
            var data = JSON.parse(result.responseText),
                form = WinJS.Utilities.query('form')[0],
                fileNameField = WinJS.Utilities.query('span[class=b-library-edit--form__filename]')[0],
                icon = WinJS.Utilities.query('div[class=b-library-edit--form__icon]')[0]
                ;

            icon.innerHTML = getType(data.type).icon;
            form.type.value = data.type;
            form.name.value = data.name;
            form.link.value = data.link;
            form.setAttribute('id', data.id);
            form.description.value = data.description;

            setMediaTitle(data.name);
            fileNameField.innerHTML = data.file;
            form.file.onchange = function (element) {
                fileNameField.innerHTML = element.target.files[0].name;
                var type = getType(element.target.files[0].type);
                form.type.value = type.text;
                icon.innerHTML = type.icon;
            }
        });

    }
    function setLibTitle (title) {
        WinJS.Utilities.query('h1[class=b-library-name]')[0].textContent = title;
    }
    function getType (type) {
        if (type.search('video') !== -1 ) {
            return {text: 'video', icon: '&#xf03d'};
        }
        if (type.search('image') !== -1) {
            return {text: 'audio', icon: '&#xf1c7'};
        }
        if (type.search('text') !== -1) {
            return {text: 'text', icon: '&#xf15c'};
        }
    }
    function setData (data) {
        mediaData.splice(0, mediaData.length);

        data.forEach(function (item) {
            mediaData.push(item);
        });
    }
    function getSelection () {
        var boxes = WinJS.Utilities.query('input[type=checkbox]:checked'),
            ids = []
        ;

        boxes.forEach(function (item) {
            ids.push(item.name);
        });
        return ids;
    }
    function setFolderTitle (title) {
        WinJS.Utilities.query('span[class=b-library-content--toolbar__title]')[0].innerHTML = title;
    }
    function setMediaTitle (title) {
        WinJS.Utilities.query('span[class=b-library-edit--toolbar__title]')[0].innerHTML = title;
    }
    function getFolderData (id) {
        var postfix = id || '';

        currentId = id;
        window.authXHR({
            url: '/api/folders/' + id,
            type: 'GET'
        }).done(function (result) {
            if (result.status !== 200) {
                return null;
            }
            var resultData = result.response;

            setPath(resultData.path);
            setLibTitle(resultData.name);
            setData(resultData.data);

        });
    }
    function setPath (path) {
        var el = WinJS.Utilities.query('div[class=b-library-path]')[0],
            length = path.length,
            libHref = document.createElement('a')
        ;

        libHref.innerHTML = 'Libraries';
        libHref.setAttribute('class', 'b_lib-href');

        el.innerHTML = "";
        el.appendChild(libHref);


        if (path.length === 0) {
            setFolderTitle('');
            WinJS.Utilities.query('button[id=path-back-btn]')[0].setAttribute('class', 'b-libraries__back-button--hidden');

        } else {
            setFolderTitle(path[length - 1].title);
            WinJS.Utilities.query('button[id=path-back-btn]')[0].setAttribute('class', 'b-libraries__back-button');
        }

        for (var i = 0; i < length; i ++) {
            var a = document.createElement('a');

            a.setAttribute('id', path[i].id);
            a.setAttribute('class', 'b_path-link');
            a.innerHTML = path[i].title;

            el.innerHTML += ' > ';

            el.appendChild(a);

        }

        WinJS.Utilities.query('a[class=b_lib-href]').listen('click', function (element) {
            WinJS.Navigation.navigate("/resources/pages/libraries.html");
        });
        WinJS.Utilities.query('a[class=b_path-link]').listen('click', function (element) {
            getFolderData(element.currentTarget.getAttribute('id'));
        });

    }
    WinJS.Namespace.define('NED.media', {
        getDisplay: WinJS.Binding.converter(function (type) {
            return type === 'media' ? 'block' : 'none';
        }),
        getPadding: WinJS.Binding.converter(function (type) {
            return type === 'media' ? '25px' : '0';
        }),
        getEditDisplay: WinJS.Binding.converter(function (type) {
            return type === 'media' ? 'none' : 'none !important';
        })
    });
    WinJS.Namespace.define('Media.ListView', {
        data: mediaData
    });
}());