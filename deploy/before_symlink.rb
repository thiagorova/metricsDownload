# Precompile assets. Assets are compiled into shared/assets and shared between deploys.
rails_env = new_resource.environment["RAILS_ENV"]
shared_path = "#{new_resource.deploy_to}/shared"

# create shared directory for assets, if it doesn't exist
directory "#{shared_path}/assets" do
  mode 0770
  action :create
  recursive true
end

# precompile assets into public/assets (which is symlinked to shared assets folder)
execute "rake assets:precompile" do
  cwd release_path
  command "bundle exec rake assets:precompile"
  environment 'RAILS_ENV' => rails_env
end
