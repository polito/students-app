source 'https://rubygems.org'

# You may use http://rbenv.org/ or https://rvm.io/ to install and use this version
ruby File.read(File.join(__dir__, '.ruby-version')).strip

gem 'fastlane'

# Exclude problematic versions of cocoapods and activesupport that causes build failures.
install_if -> { RUBY_PLATFORM =~ /darwin/ } do
    gem 'cocoapods', '>= 1.13', '!= 1.15.0', '!= 1.15.1'
end
gem 'activesupport', '>= 6.1.7.5', '!= 7.1.0'
gem 'xcodeproj', '< 1.26.0'


plugins_path = File.join(File.dirname(__FILE__), 'ios', 'fastlane', 'Pluginfile')
eval_gemfile(plugins_path) if File.exist?(plugins_path)

plugins_path = File.join(File.dirname(__FILE__), 'android', 'fastlane', 'Pluginfile')
eval_gemfile(plugins_path) if File.exist?(plugins_path)