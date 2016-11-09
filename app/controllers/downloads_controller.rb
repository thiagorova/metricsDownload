require "zip"

class DownloadsController < ApplicationController

  def index
    if userLogin
      render :layout => "download"
    end
  end

  def getTool
    userLogin
    tool = params["tool"]
    downloadPath = File.join(Rails.root, "public", "download")
    path = File.join(Rails.root, "public", "download", "authorship-tags")
    FileUtils.rm_rf(path)
    FileUtils.copy_entry downloadPath + "/" + tool, path
    addApiKey(tool, params["key"], path)
    compress(path, downloadPath)
     respond_to do |format|
      format.json { render json: { "nothing" => ""}}
      format.html
      format.js
    end    
  end

  def addApiKey(tool, key, path)
    filename = path + "/js/main.js"
    text = File.read(filename)
    new_contents = text.gsub(/replace_this_text_with_you_API_key/, key)
    File.open(filename, "w") {|file| file.puts new_contents }
  end
  
  def compress(folder, zipPath)
    folder.sub!(%r[/$],'')
    archive = File.join(zipPath,File.basename(zipPath))+'.zip'
    FileUtils.rm archive, :force=>true
    ::Zip::File.open(archive, 'w') do |zipfile|
      Dir["#{folder}/**/**"].reject{|f|f==archive}.each do |file|
        zipfile.add(file.sub(folder+'/',''),file)
      end
    end
  end  
  
end
