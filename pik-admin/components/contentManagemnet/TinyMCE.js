import React from 'react'
import { Editor } from '@tinymce/tinymce-react'
import cookie from 'js-cookie'

const TinyMCE = (props) => {
  const handleEditorChange = (content, editor) => {
    props.onEditorChange(content)
  }

  const imageUploadHandler = (blobInfo, success, failure, progress) => {
    let xhr, formData

    xhr = new XMLHttpRequest()
    xhr.open(
      'POST',
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/0.1/admin/content/upload`
    )
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*')
    xhr.setRequestHeader(
      'Authorization',
      `Bearer ${cookie.get('next_auth_token')}`
    )
    xhr.upload.onprogress = function (e) {
      progress((e.loaded / e.total) * 100)
    }

    xhr.onload = function () {
      var json

      if (xhr.status === 403) {
        failure('HTTP Error: ' + xhr.status, { remove: true })
        return
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        failure('HTTP Error: ' + xhr.status)
        return
      }

      json = JSON.parse(xhr.responseText)

      if (!json || typeof json.location != 'string') {
        failure('Invalid JSON: ' + xhr.responseText)
        return
      }

      success(json.location)
    }

    xhr.onerror = function () {
      failure(
        'Image upload failed due to a XHR Transport error. Code: ' + xhr.status
      )
    }

    formData = new FormData()
    formData.append('file', blobInfo.blob(), blobInfo.filename())

    xhr.send(formData)
  }
  return (
    <Editor
      apiKey="obaodq35qhc922lrjeqof66xxh91dio2apbtut3ffno0x06t"
      value={props.data}
      init={{
        height: 500,
        menubar: false,
        plugins: [
          'print preview powerpaste casechange importcss searchreplace autolink autosave save directionality advcode visualblocks visualchars fullscreen image link media mediaembed template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists checklist wordcount tinymcespellchecker a11ychecker  textpattern noneditable help formatpainter permanentpen pageembed charmap  mentions quickbars linkchecker emoticons advtable'
        ],

        toolbar:
          'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor casechange permanentpen formatpainter removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | editimage image link anchor codes | ltr rtl | showcomments addcomment |rotateleft rotateright |  imageoptions',

        images_upload_handler: imageUploadHandler
      }}
      onEditorChange={handleEditorChange}
    />
  )
}

export default TinyMCE
