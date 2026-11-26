require 'json'
require 'nokogiri'
require 'pathname'
require 'uri'

Dir.chdir(File.join(__dir__, '..'))
origin = 'https://poimoru-blog.satorunaoi0731.workers.dev'
files = Dir.glob('{articles,categories}/*.html') + %w[index.html privacy.html disclaimer.html]
docs = files.to_h { |file| [file, Nokogiri::HTML(File.read(file))] }
errors = []
errors << 'Shared header/footer out of sync' unless system('node', 'scripts/sync-site-chrome.cjs', '--check')

def resolve(path)
  local = path.sub(%r{\A/}, '')
  return local + 'index.html' if path.end_with?('/')
  File.file?(local) ? local : local + '.html'
end

def image_path(origin, file, image)
  uri = URI.join("#{origin}/#{file}", image['src'].to_s)
  [uri.host, uri.path]
rescue URI::InvalidURIError
  nil
end

docs.each do |file, doc|
  errors << "#{file}: missing title or description" unless doc.at_css('title') && doc.at_css('meta[name=description]')
  errors << "#{file}: missing site header/footer" unless doc.at_css('header.site-header') && doc.at_css('footer.site-footer')
  ids = doc.css('[id]').map { |node| node['id'] }
  errors << "#{file}: duplicate IDs" unless ids.uniq == ids
  if file.start_with?('articles/')
    covers = doc.css('.article-cover')
    cover_paths = covers.map { |cover| image_path(origin, file, cover) }.compact
    body_images = doc.css('.article-content img').map { |img| image_path(origin, file, img) }.compact
    if covers.size > 1 || !(cover_paths & body_images).empty?
      errors << "#{file}: duplicate article cover"
    end
  end
  doc.css('script[type="application/ld+json"]').each { |node| JSON.parse(node.content) }
  doc.css('a[href], img[src], script[src], link[href]').each do |node|
    raw = node['href'] || node['src']
    next if raw.start_with?('mailto:', 'tel:', 'data:')
    url = URI.join("#{origin}/#{file}", raw)
    next if url.host != URI(origin).host
    path = resolve(url.path)
    if !File.file?(path)
      errors << "#{file}: missing #{raw}"
    elsif url.fragment && docs[path] && !docs[path].css('[id]').any? { |item| item['id'] == url.fragment }
      errors << "#{file}: missing anchor #{raw}"
    end
  rescue URI::InvalidURIError
    errors << "#{file}: invalid URL #{raw}"
  end
end

locs = Nokogiri::XML(File.read('sitemap.xml')) { |config| config.strict }.remove_namespaces!.css('loc').map(&:text)
errors << 'sitemap: duplicate locations' unless locs.uniq == locs
locs.each do |loc|
  doc = docs[resolve(URI(loc).path)]
  errors << "#{loc}: sitemap/canonical mismatch" unless doc && doc.at_css('link[rel=canonical]')&.[]('href') == loc
  errors << "#{loc}: noindex in sitemap" if doc && doc.at_css('meta[name=robots]')&.[]('content')&.include?('noindex')
end
docs.each do |file, doc|
  next unless file == 'index.html' || file.start_with?('articles/', 'categories/')
  next if doc.at_css('meta[name=robots]')&.[]('content')&.include?('noindex')
  errors << "#{file}: not in sitemap" unless locs.include?(doc.at_css('link[rel=canonical]')&.[]('href'))
end
abort errors.uniq.join("\n") unless errors.empty?
puts "#{docs.size} pages; internal URLs, IDs, metadata, and #{locs.size} sitemap entries OK"
