import {
    get_dom_data
} from './../lib/helper';

jQuery.fn.exists = function () {
    return jQuery(this).length > 0;
}
var atbdp_plupload_params = get_dom_data('atbdp_plupload_params');
var atbdp_params = get_dom_data('atbdp_params');
const $ = jQuery;

// Init
if (atbdp_plupload_params) {
    jQuery(document).ready(init);
    window.addEventListener('directorist-reload-plupload', init);
}


function init() {
    atbdp_plupload_params = get_dom_data('atbdp_plupload_params');
    atbdp_params = get_dom_data('atbdp_params');

    if ($(".plupload-upload-uic").exists()) {
        let pluploadConfig, msgErr, post_id;

        // set the post id
        if (jQuery("#atbdpectory-add-post input[name='ID']").length) {
            post_id = jQuery("#atbdpectory-add-post input[name='ID']").val(); // frontend
        } else {
            post_id = jQuery("#post input[name='post_ID']").val(); // backend
        }

        $(".plupload-upload-uic").each(function (ind, el) {
            const $this = $(this);
            const imgId = $this.attr("id").replace("plupload-upload-ui", "");
            const $errorHolder = jQuery('#' + imgId + 'upload-error');

            plu_show_thumbs(imgId);

            pluploadConfig = JSON.parse(atbdp_plupload_params.base_plupload_config);

            pluploadConfig["browse_button"] = imgId + pluploadConfig["browse_button"];
            pluploadConfig["container"] = imgId + pluploadConfig["container"];

            if (jQuery('#' + imgId + 'dropbox').length) {
                pluploadConfig["drop_element"] = imgId + 'dropbox';
            } // only add drop area if there is one

            pluploadConfig["file_data_name"] = imgId + pluploadConfig["file_data_name"];
            pluploadConfig["multipart_params"]["imgid"] = imgId;
            pluploadConfig["multipart_params"]["post_id"] = post_id;
            pluploadConfig["max_file_size"] = $('#' + imgId + '_file_size').val();

            if ($this.hasClass("plupload-upload-uic-multiple")) {
                pluploadConfig["multi_selection"] = true;
            }

            var allowed_exts = jQuery('#' + imgId + '_allowed_types').val();
            allowed_exts = allowed_exts && allowed_exts != '' ? allowed_exts : '';
            if (imgId == 'post_images' && typeof atbdp_params.atbdp_allowed_img_types != 'undefined' && atbdp_params.atbdp_allowed_img_types != '') {
                allowed_exts = atbdp_params.atbdp_allowed_img_types;
            }

            if (allowed_exts && allowed_exts != '') {
                var txt_all_files = (typeof atbdp_params.txt_all_files != 'undefined' && atbdp_params.txt_all_files != '') ? atbdp_params.txt_all_files : 'Allowed files';
                pluploadConfig['filters'] = [{
                    'title': txt_all_files,
                    'extensions': allowed_exts
                }];
            }

            var uploader = new plupload.Uploader(pluploadConfig);

            uploader.bind('Init', function (up, params) {
                if (uploader.features.dragdrop) {
                    var drop_id = imgId + 'dropbox';
                    var target = jQuery('#' + drop_id);

                    target.on("dragenter", function (event) {
                        target.addClass("dragover");
                    });

                    target.on("dragleave", function (event) {
                        target.removeClass("dragover");
                    });

                    target.on("drop", function () {
                        target.removeClass("dragover");
                    });
                }
            });

            uploader.init();

            uploader.bind('Error', function (up, files) {
                let errorMessage;

                $errorHolder.addClass('upload-error');

                if (files.code == -600) {
                    if (typeof atbdp_params.err_max_file_size != 'undefined' && atbdp_params.err_max_file_size != '') {
                        errorMessage = atbdp_params.err_max_file_size;
                    } else {
                        errorMessage = 'File size error : You tried to upload a file over %s';
                    }
                    errorMessage = errorMessage.replace("%s", $('#' + imgId + '_file_size').val());
                } else if (files.code == -601) {
                    if (typeof atbdp_params.err_file_type != 'undefined' && atbdp_params.err_file_type != '') {
                        errorMessage = atbdp_params.err_file_type;
                    } else {
                        errorMessage = 'File type error. Allowed file types: %s';
                    }

                    if (imgId == 'post_images') {
                        var txtReplace = allowed_exts != '' ? "." + allowed_exts.replace(/,/g, ", .") : '*';
                        errorMessage = errorMessage.replace("%s", txtReplace);
                    } else {
                        errorMessage = errorMessage.replace("%s", jQuery("#" + imgId + "_allowed_types").attr('data-exts'));
                    }
                } else {
                    errorMessage = files.message;
                }

                $errorHolder.html(errorMessage);
            });

            //a file was added in the queue
            //totalImg = atbdp_plupload_params.totalImg;
            //limitImg = atbdp_plupload_params.image_limit;
            uploader.bind('FilesAdded', function (up, files) {
                var totalImg = parseInt(jQuery("#" + imgId + "totImg").val());
                var limitImg = parseInt(jQuery("#" + imgId + "image_limit").val());

                $errorHolder.html('').removeClass('upload-error');

                if (limitImg && $this.hasClass("plupload-upload-uic-multiple") && limitImg > 0) {
                    if (totalImg >= limitImg && limitImg > 0) {
                        while (up.files.length > 0) {
                            up.removeFile(up.files[0]);
                        } // remove images

                        if (typeof atbdp_params.err_file_upload_limit != 'undefined' && atbdp_params.err_file_upload_limit != '') {
                            msgErr = atbdp_params.err_file_upload_limit;
                        } else {
                            msgErr = 'You have reached your upload limit of %s files.';
                        }
                        msgErr = msgErr.replace("%s", limitImg);

                        $errorHolder.addClass('upload-error').html(msgErr);

                        return false;
                    }

                    if (up.files.length > limitImg && limitImg > 0) {
                        while (up.files.length > 0) {
                            up.removeFile(up.files[0]);
                        } // remove images

                        if (typeof atbdp_params.err_pkg_upload_limit != 'undefined' && atbdp_params.err_pkg_upload_limit != '') {
                            msgErr = atbdp_params.err_pkg_upload_limit;
                        } else {
                            msgErr = 'You may only upload %s files with this package, please try again.';
                        }
                        msgErr = msgErr.replace("%s", limitImg);

                        $errorHolder.addClass('upload-error').html(msgErr);
                        return false;
                    }
                }

                $.each(files, function (i, file) {
                    $this.find('.filelist').append('<div class="file" id="' + file.id + '"><b>' + file.name + '</b> (<span>' + plupload.formatSize(0) + '</span>/' + plupload.formatSize(file.size) + ') ' + '<div class="fileprogress"></div></div>');
                });

                up.refresh();
                up.start();
            });

            uploader.bind('UploadProgress', function (up, file) {
                $('#' + file.id + " .fileprogress").width(file.percent + "%");
                $('#' + file.id + " span").html(plupload.formatSize(parseInt(file.size * file.percent / 100)));
            });

            var timer;
            var i = 0;
            var indexes = new Array();
            uploader.bind('FileUploaded', function (up, file, response) {
                response = JSON.parse(response["response"]);

                if (!response.success) {
                    $errorHolder.addClass('upload-error').html(response.data);
                    return;
                }

                //up.removeFile(up.files[0]); // remove images
                var totalImg = parseInt(jQuery("#" + imgId + "totImg").val());
                indexes[i] = up;

                i++;
                $('#' + file.id).fadeOut();

                // add url to the hidden field
                if ($this.hasClass("plupload-upload-uic-multiple")) {
                    totalImg++;
                    jQuery("#" + imgId + "totImg").val(totalImg);
                    // multiple
                    var v1 = $.trim($("#" + imgId, $('#' + imgId + 'plupload-upload-ui').parent()).val());
                    if (v1) {
                        v1 = v1 + "::" + response.data;
                    } else {
                        v1 = response.data;
                    }
                    $("#" + imgId, $('#' + imgId + 'plupload-upload-ui').parent()).val(v1);
                    //console.log(v1);
                } else {
                    // single
                    $("#" + imgId, $('#' + imgId + 'plupload-upload-ui').parent()).val(response.data + "");
                    //console.log(response);
                }
                // show thumbs
                plu_show_thumbs(imgId);
            });

            Error
        });
    }
}

function atbdp_esc_entities(str) {
    var entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

    return String(str).replace(/[&<>"'`=\/]/g, function (s) {
        return entityMap[s];
    });
}

function atbdp_remove_file_index(indexes) {
    for (var i = 0; i < indexes.length; i++) {
        if (indexes[i].files.length > 0) {
            indexes[i].removeFile(indexes[i].files[0]);
        }
    }
}

function plu_show_thumbs(imgId) {
    //console.log("plu_show_thumbs");
    var totalImg = parseInt(jQuery("#" + imgId + "totImg").val());
    var limitImg = parseInt(jQuery("#" + imgId + "image_limit").val());
    var $ = jQuery;
    var thumbsC = $("#" + imgId + "plupload-thumbs");
    thumbsC.html("");
    // get urls
    var imagesS = $("#" + imgId, $('#' + imgId + 'plupload-upload-ui').parent()).val();

    var txtRemove = 'Remove';
    if (typeof atbdp_params.action_remove != 'undefined' && atbdp_params.action_remove != '') {
        txtRemove = atbdp_params.action_remove;
    }

    if (!imagesS) {
        return;
    }

    var images = imagesS.split("::");

    for (var i = 0; i < images.length; i++) {
        if (images[i] && images[i] != 'null') {

            var img_arr = images[i].split("|");
            var image_url = img_arr[0];
            var image_id = img_arr[1];
            var image_title = img_arr[2];
            var image_caption = img_arr[3];
            var image_title_html = '';
            var image_caption_html = '';

            // fix undefined id
            if (typeof image_id === "undefined") {
                image_id = '';
            }
            // fix undefined title
            if (typeof image_title === "undefined") {
                image_title = '';
            }
            // fix undefined title
            if (typeof image_caption === "undefined") {
                image_caption = '';
            }

            //Esc title and caption
            image_title = atbdp_esc_entities(image_title);
            image_caption = atbdp_esc_entities(image_caption);

            var file_ext = image_url.substring(image_url.lastIndexOf('.') + 1);

            file_ext = file_ext.split('?').shift(); // in case the image url has params
            if (file_ext) {
                file_ext = file_ext.toLowerCase();
            }
            var fileNameIndex = image_url.lastIndexOf("/") + 1;
            var dotIndex = image_url.lastIndexOf('.');
            if (dotIndex < fileNameIndex) {
                continue;
            }
            var file_name = image_url.substr(fileNameIndex, dotIndex < fileNameIndex ? loc.length : dotIndex);

            var file_display = '';
            var file_display_class = '';
            if (file_ext == 'jpg' || file_ext == 'jpe' || file_ext == 'jpeg' || file_ext == 'png' || file_ext == 'gif' || file_ext == 'bmp' || file_ext == 'ico') {
                file_display = '<img class="atbdp-file-info" data-id="' + image_id + '" data-title="' + image_title + '" data-caption="' + image_caption + '" data-src="' + image_url + '" src="' + image_url + '" alt=""  />';
                if (!!image_title.trim()) {
                    image_title_html = '<span class="atbdp-title-preview">' + image_title + '</span>';
                }
                if (!!image_caption.trim()) {
                    image_caption_html = '<span class="atbdp-caption-preview">' + image_caption + '</span>';
                }
            } else {
                var file_type_class = 'la-file';
                if (file_ext == 'pdf') {
                    file_type_class = 'la-file-pdf-o';
                } else if (file_ext == 'zip' || file_ext == 'tar') {
                    file_type_class = 'la-file-zip-o';
                } else if (file_ext == 'doc' || file_ext == 'odt') {
                    file_type_class = 'la-file-word-0';
                } else if (file_ext == 'txt' || file_ext == 'text') {
                    file_type_class = 'la-file-text-0';
                } else if (file_ext == 'csv' || file_ext == 'ods' || file_ext == 'ots') {
                    file_type_class = 'la-file-excel-0';
                } else if (file_ext == 'avi' || file_ext == 'mp4' || file_ext == 'mov') {
                    file_type_class = 'la-file-video-0';
                }
                file_display_class = 'file-thumb';
                file_display = '<i title="' + file_name + '" class="la ' + file_type_class + ' atbdp-file-info" data-id="' + image_id + '" data-title="' + image_title + '" data-caption="' + image_caption + '" data-src="' + image_url + '" aria-hidden="true"></i>';
            }

            let iconURL = directorist.assets_url + 'icons/font-awesome/svgs/solid/trash.svg';
            let iconHTML = directorist.icon_markup.replace( '##URL##', iconURL ).replace( '##CLASS##', '' );

            var thumb = $('<div class="thumb ' + file_display_class + '" id="thumb' + imgId + i + '">' +
                image_title_html +
                file_display +
                image_caption_html +
                '<div class="atbdp-thumb-actions">' +
                '<span class="thumbremovelink" id="thumbremovelink' + imgId + i + '">'+iconHTML+'</span>' +
                '</div>' +
                '</div>');

            thumbsC.append(thumb);

            thumb.find(".thumbremovelink").click(function () {
                //console.log("plu_show_thumbs-thumbremovelink");
                if (jQuery('#' + imgId + 'plupload-upload-ui').hasClass("plupload-upload-uic-multiple")) {
                    totalImg--; // remove image from total
                    jQuery("#" + imgId + "totImg").val(totalImg);
                }
                jQuery('#' + imgId + 'upload-error').html('');
                jQuery('#' + imgId + 'upload-error').removeClass('upload-error');
                var ki = $(this).attr("id").replace("thumbremovelink" + imgId, "");
                ki = parseInt(ki);
                var kimages = [];
                imagesS = $("#" + imgId, $('#' + imgId + 'plupload-upload-ui').parent()).val();
                images = imagesS.split("::");
                for (var j = 0; j < images.length; j++) {
                    if (j != ki) {
                        kimages[kimages.length] = images[j];
                    }
                }
                $("#" + imgId, $('#' + imgId + 'plupload-upload-ui').parent()).val(kimages.join("::"));
                //console.log("plu_show_thumbs-thumbremovelink-run");
                plu_show_thumbs(imgId);
                return false;
            });
        }
    }

    if (images.length > 1) {
        //console.log("plu_show_thumbs-sortable");
        thumbsC.sortable({
            update: function (event, ui) {
                var kimages = [];
                thumbsC.find(".atbdp-file-info").each(function () {
                    kimages[kimages.length] = $(this).data("src") + "|" + $(this).data("id") + "|" + $(this).data("title") + "|" + $(this).data("caption");
                    $("#" + imgId, $('#' + imgId + 'plupload-upload-ui').parent()).val(kimages.join("::"));
                    plu_show_thumbs(imgId);
                    //console.log("plu_show_thumbs-sortable-run");
                });
            }
        });
        thumbsC.disableSelection();
    }

    // we need to run the basics here.
    //console.log("run basics");

    var kimages = [];
    thumbsC.find(".atbdp-file-info").each(function () {
        kimages[kimages.length] = $(this).data("src") + "|" + $(this).data("id") + "|" + $(this).data("title") + "|" + $(this).data("caption");
        $("#" + imgId, $('#' + imgId + 'plupload-upload-ui').parent()).val(kimages.join("::"));
    });
}

function gd_edit_image_meta(input, order_id) {
    var imagesS = jQuery("#" + input.id, jQuery('#' + input.id + 'plupload-upload-ui').parent()).val();
    var images = imagesS.split("::");
    var img_arr = images[order_id].split("|");
    var image_title = img_arr[2];
    var image_caption = img_arr[3];
    var html = '';

    html = html + "<div class='atbdp-modal-text'><label for='atbdp-image-meta-title'>" + atbdp_params.label_title + "</label><input id='atbdp-image-meta-title' value='" + image_title + "'></div>"; // title value
    html = html + "<div class='atbdp-modal-text'><label for='atbdp-image-meta-caption'>" + atbdp_params.label_caption + "</label><input id='atbdp-image-meta-caption' value='" + image_caption + "'></div>"; // caption value
    html = html + "<div class='atbdp-modal-button'><button class='button button-primary button-large' onclick='gd_set_image_meta(\"" + input.id + "\"," + order_id + ")'>" + atbdp_params.button_set + "</button></div>"; // caption value
    jQuery('#atbdp-image-meta-input').html(html);
    lity('#atbdp-image-meta-input');

}

function gd_set_image_meta(input_id, order_id) {
    //alert(order_id);
    var imagesS = jQuery("#" + input_id, jQuery('#' + input_id + 'plupload-upload-ui').parent()).val();
    var images = imagesS.split("::");
    var img_arr = images[order_id].split("|");
    var image_url = img_arr[0];
    var image_id = img_arr[1];
    var image_title = atbdp_esc_entities(jQuery('#atbdp-image-meta-title').val());
    var image_caption = atbdp_esc_entities(jQuery('#atbdp-image-meta-caption').val());
    images[order_id] = image_url + "|" + image_id + "|" + image_title + "|" + image_caption;
    imagesS = images.join("::");
    jQuery("#" + input_id, jQuery('#' + input_id + 'plupload-upload-ui').parent()).val(imagesS);
    plu_show_thumbs(input_id);
    jQuery('[data-lity-close]', window.parent.document).trigger('click');
}