import {
  FaFile,
  FaFileAudio,
  FaFileCode,
  FaFileCsv,
  FaFileExcel,
  FaFileImage,
  FaFileLines,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileVideo,
  FaFileWord,
  FaFileZipper,
  FaFolderClosed
} from 'react-icons/fa6'

export interface FileIconProps {
  name?: string
  isDirectory?: boolean
}

const FileIcon = (props: FileIconProps) => {
  const { name, isDirectory = false } = props
  if (isDirectory) {
    return <FaFolderClosed className="text-yellow-500" />
  }

  const ext = name?.split('.').pop() || ''
  if (ext) {
    switch (ext.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'bmp':
      case 'ico':
      case 'webp':
      case 'tiff':
      case 'tif':
      case 'heic':
      case 'heif':
      case 'avif':
      case 'apng':
      case 'flif':
      case 'ai':
      case 'psd':
      case 'xcf':
      case 'sketch':
      case 'fig':
      case 'xd':
      case 'svgz':
        return <FaFileImage className="text-green-500" />
      case 'pdf':
        return <FaFilePdf className="text-red-500" />
      case 'doc':
      case 'docx':
        return <FaFileWord className="text-blue-500" />
      case 'xls':
      case 'xlsx':
        return <FaFileExcel className="text-green-500" />
      case 'csv':
        return <FaFileCsv className="text-green-500" />
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint className="text-red-500" />
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
      case 'bz2':
      case 'xz':
      case 'lz':
      case 'lzma':
      case 'zst':
      case 'zstd':
      case 'z':
      case 'taz':
      case 'tz':
      case 'tzo':
        return <FaFileZipper className="text-green-500" />
      case 'txt':
        return <FaFileLines className="text-gray-500" />
      case 'mp3':
      case 'wav':
      case 'flac':
        return <FaFileAudio className="text-green-500" />
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
        return <FaFileVideo className="text-red-500" />
      case 'html':
      case 'css':
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'json':
      case 'xml':
      case 'yaml':
      case 'yml':
      case 'md':
      case 'sh':
      case 'py':
      case 'java':
      case 'c':
      case 'cpp':
      case 'cs':
      case 'go':
      case 'php':
      case 'rb':
      case 'pl':
      case 'swift':
      case 'kt':
      case 'rs':
      case 'sql':
      case 'r':
      case 'scala':
      case 'groovy':
      case 'dart':
      case 'lua':
      case 'perl':
      case 'h':
      case 'm':
      case 'mm':
      case 'makefile':
      case 'cmake':
      case 'dockerfile':
      case 'gradle':
      case 'properties':
      case 'ini':
      case 'conf':
      case 'env':
      case 'bat':
      case 'cmd':
      case 'ps1':
      case 'psm1':
      case 'psd1':
      case 'ps1xml':
      case 'psc1':
      case 'pssc':
      case 'nuspec':
      case 'resx':
      case 'resw':
      case 'csproj':
      case 'vbproj':
      case 'vcxproj':
      case 'fsproj':
      case 'sln':
      case 'suo':
      case 'user':
      case 'userosscache':
      case 'sln.docstates':
      case 'dll':
        return <FaFileCode className="text-blue-500" />
      default:
        return <FaFile className="text-gray-500" />
    }
  }

  return <FaFile className="text-gray-500" />
}

export default FileIcon
