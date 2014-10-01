(function () {
    'use strict';

    var mediaData = new WinJS.Binding.List(),
        currentId,
        buffer = {}
        ;

    WinJS.UI.Pages.define('/resources/pages/edit-library.html', {
        ready: function (element, options) {
            var me = this;
            var listView = WinJS.Utilities.query('div[data-win-control="WinJS.UI.ListView"]', element);

            WinJS.Utilities.query('button[id=path-back-btn]').listen('click', function () {
                var link = WinJS.Utilities.query('div[class=b-library-path]', element)[0].lastChild;
                me.getFolderData({id: link.id});
            });

            WinJS.Utilities.query('button[class=b-library-new-folder-btn]').listen('click', function () {
                window.showPopup('/resources/pages/popups/add-new-folder.html', {
                    parentId: currentId,
                    success: function () {
                        me.getFolderData({id: currentId});
                    },
                    error: function () {

                    }
                });
            });
            WinJS.Utilities.query('button[class=b-library-new-media-btn]').listen('click', function () {
                window.showPopup('/resources/pages/popups/add-new-media.html', {
                    libraryId: currentId,
                    callback: function () {
                        setTimeout(function () {
                            me.getFolderData({id: currentId});
                        }, 500);

                    },
                    error: function () {
                        window.showPopup('/resources/pages/popups/alert.html', {
                            msg: 'Failed to upload. Check your file or data connection'
                        });
                    }
                })
            });
            WinJS.Utilities.query('button[class=b-libraries__cut-button]', element).listen('click', function () {
                buffer.data = getSelection();
                if (buffer.data.length === 0) {
                    return false;
                }
                WinJS.Utilities.query('button[class=b-libraries__paste-button]', element)[0].disabled = false;

                var boxes = WinJS.Utilities.query('input[type=checkbox]');
                boxes.forEach(function (item) {
                    item.parentNode.parentNode.parentElement.setAttribute('class', 'b_media-list-tpl--item');
                });

                boxes = WinJS.Utilities.query('input[type=checkbox]:checked');

                boxes.forEach(function (item) {
                    item.parentNode.parentNode.parentElement.setAttribute('class', 'b_media-list-tpl--item' +
                        ' b_media-list-tpl--item-cut');
                });
                buffer.type = 'move';
            });
            WinJS.Utilities.query('button[class=b-libraries__delete-button]', element).listen('click', function () {
                buffer.data = getSelection();

                if (buffer.data.length === 0) {
                    return false;
                }
                window.showPopup('/resources/pages/popups/delete-confirm.html', {callback: function () {
                    MED.Server.authXHR({
                        url: '/api/contentActions/delete',
                        type: 'POST',
                        data: JSON.stringify(buffer.data)
                    }).done(function (result) {
                            me.getFolderData({id: currentId});

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
                var data = {destination: currentId, content: buffer.data};
                MED.Server.authXHR({
                    url: '/api/contentActions/move',
                    type: 'POST',
                    data: JSON.stringify(data)
                }).done(
                    function (result) {

                        me.getFolderData({id: currentId});
                        var boxes = WinJS.Utilities.query('input[type=checkbox]');
                        boxes.forEach(function (item) {
                            item.parentNode.parentNode.setAttribute('class', 'b_media-list-tpl--item');
                            WinJS.Utilities.query('button[class=b-libraries__paste-button]', element)[0].disabled = true;

                        });
                    },
                    function (err) {
                        console.log(err);
                        if (err.statusCode === 409) {
                            window.showPopup('/resources/pages/popups/alert.html', {
                                msg: 'The paste operation can not be used. Please choose another folder to paste items.'
                            });
                        }
                    }
                );
            });

            WinJS.Utilities.query('button[class=b-libraries__save-button]', element).listen('click', function () {
                var form = element.querySelector('form'),
                    data = {
                        name: form.name.value,
                        links: form.link.value,
                        description: form.description.value
                    };

                MED.Server.authXHR({
                    url: '/api/media/' + form.dataset.id,
                    type: 'PUT',
                    data: JSON.stringify(data)
                }).done(function (result) {
                    console.log(result.status);

                    me.getFolderData({id: currentId});
                    me.setForm(data);
                });
            });

            listView.listen('click', function (event) {
                event.stopPropagation();
                var currTarget = event.target,
                    listItem = currTarget
                    ;

                if (currTarget.className === 'b_body-box') {

                    var input = currTarget.parentNode.querySelector('input');
                    input.checked = !input.checked;
                    setBntDisable(getSelection().length === 0);
                    event.preventDefault();

                } else if (currTarget.className === 'b_media-list-tpl--item__edit'
                    || currTarget.className === 'fa fa-pencil') {

                    while (listItem.className !== 'b_media-list-tpl--item') {
                        listItem = listItem.parentNode;
                    }

                    var id = listItem.querySelector('input[type=checkbox]').name,
                        name = listItem.parentNode.querySelector('h3').innerHTML
                    ;

                    window.showPopup('/resources/pages/popups/edit-folder.html', {
                        id: id,
                        name: name,
                        success: function () {
                            me.getFolderData({id: currentId});
                        }
                    });
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

                    for (var i = 0; i < mediaItems.length; i++) {
                        mediaItems[i].setAttribute('class', 'b_media-list-tpl--item');
                    }

                    if (type.display === 'none') {
                        WinJS.Utilities.query('div[id=media_edit]')[0].className = 'b-library-edit';
                        if (item) {
                            item.setAttribute('class', 'b_media-list-tpl--item b_current-media');
                        }
                        me.setMediaForm(itemId);
                    } else {
                        WinJS.Utilities.query('div[id=media_edit]')[0].className = 'b-library-edit hidden';
                        WinJS.Navigation.navigate('/resources/pages/edit-library.html', {id: itemId});
                    }
                    event.preventDefault();
                }

            });

            WinJS.UI.processAll(element);

            if (options.type && options.type === 'media') {
                me.selectMedia(options.id, options.folder, element);
            } else {
                me.getFolderData({id: options.id});
            }


        },
        getMedia: function (config) {
            MED.Server.authXHR({
                url: '/api/media/' + config.id,
                type: 'GET'
            }).done(
                function (result) {
                    if (result.status !== 200) {
                        return null;
                    }
                    var data = result.response;
                    if (config.success && typeof(config.success) === 'function') {
                        config.success(data);
                    }
                },
                function (err) {
                    console.log(err);
                    if (config.error && typeof(config.error) === 'function') {
                        config.error.call();
                    }
                }
            );
        },
        getFolderData: function (config) {
            var me = this
                ;

            currentId = config.id;
            MED.Server.authXHR({
                url: '/api/folders/' + config.id,
                type: 'GET'
            }).done(
                function (result) {
                    if (result.status !== 200) {
                        return null;
                    }
                    var resultData = result.response;

                    me.setPath(resultData.path);
                    setLibTitle(resultData.name);
                    setData(resultData.data);
                    if (config.success && typeof(config.success) === 'function') {
                        config.success(resultData);
                    }

                },
                function (err) {
                    console.log(err);
                    if (config.error && typeof(config.error) === 'function') {
                        config.error(err);
                    }
                }
            );
        },
        setForm: function (data) {
            var form = WinJS.Utilities.query('form')[0],
                formContainer = WinJS.Utilities.query('.b-library-edit'),
                icon = WinJS.Utilities.query('div[class=b-library-edit--form__icon]')[0],
                converedMsg = WinJS.Utilities.query('div.b_converted')
            ;

            if (data.type) {
                icon.innerHTML = getType(data.type).icon;
                form.type.value = data.type;
            }
            if (!data.convertedFile) {
                converedMsg.removeClass('hidden');
            } else {
                converedMsg.addClass('hidden');
            }
            form.link.value = data.links;
            form.name.value = data.name;
            form.setAttribute('data-id', data.id);
            form.description.value = data.description;

            setMediaTitle(data.name);
            formContainer.removeClass('hidden');
        },
        setMediaForm: function (id) {
            this.getMedia({id: id, success: this.setForm});
        },
        setPath: function (path) {
            var el = WinJS.Utilities.query('div[class=b-library-path]')[0],
                length = path.length,
                me = this,
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
                WinJS.Navigation.navigate('/resources/pages/edit-library.html', {id: element.currentTarget.getAttribute('id')});
            });

        },
        selectMedia: function (id, folderId, element) {
            var me = this,
                listView = WinJS.Utilities.query('div[data-win-control="WinJS.UI.ListView"]', element)
            ;
            me.getFolderData({id: folderId});
            this.getMedia({id: id, success: function (data) {
                me.setForm(data);

                function handler () {

                    if (listView[0].winControl.loadingState === 'complete') {

                        var items = WinJS.Utilities.query('.b_media-list-tpl--item'),
                            checkBox
                        ;

                        for (var i = 0; i < items.length; i ++) {
                            checkBox = items[i].querySelector('input[type=checkbox]');

                            if (checkBox.name === id && checkBox.dataset.type === 'media') {
                                items[i].className += ' b_current-media';
                                WinJS.Utilities.query('div[id=media_edit]')[0].className = 'b-library-edit';
                                listView[0].winControl.removeEventListener('loadingstatechanged', handler, false);

                            }
                        }
                    }
                }
                listView[0].winControl.addEventListener('loadingstatechanged', handler);
            }});
        }
    });
    function setBntDisable (disabled) {
        WinJS.Utilities.query('button[class=b-libraries__cut-button]')[0].disabled = disabled;
        WinJS.Utilities.query('button[class=b-libraries__delete-button]')[0].disabled = disabled;
        WinJS.Utilities.query('button[class=b-libraries__copy-button]')[0].disabled = disabled;
    }
    function setLibTitle (title) {
        WinJS.Utilities.query('h1[class=b-library-name]')[0].textContent = title;
    }
    function getType (type) {
        if (type.search('video') !== -1 ) {
            return {text: 'video', icon: '&#xf03d'};
        }
        if (type.search('image') !== -1) {
            return {text: 'image', icon: '&#xf03e'};
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
            ids.push({id: item.name, type: item.dataset.type});
        });
        return ids;
    }
    function setFolderTitle (title) {
        WinJS.Utilities.query('span[class=b-library-content--toolbar__title]')[0].innerHTML = title;
    }
    function setMediaTitle (title) {
        WinJS.Utilities.query('span[class=b-library-edit--toolbar__title]')[0].innerHTML = title;
    }
    WinJS.Namespace.define('NED.media', {
        getDisplay: WinJS.Binding.converter(function (type) {
            return type === 'media' ? 'block' : 'none';
        }),
        getSrc: WinJS.Binding.converter(function (src) {
            if (src === null) {
                return '/resources/images/stub.png'
            }
            return src;
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