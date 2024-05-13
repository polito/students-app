source "https://rubygems.org"

# You may use http://rbenv.org/ or https://rvm.io/ to install and use this version
ruby File.read(File.join(__dir__, '.ruby-version')).strip

gem 'fastlane'
install_if -> { RUBY_PLATFORM =~ /darwin/ } do
    gem 'cocoapods', '~> 1.14', '>= 1.14.3'
end

plugins_path = File.join(File.dirname(__FILE__), 'fastlane', 'Pluginfile')
eval_gemfile(plugins_path) if File.exist?(plugins_path)
