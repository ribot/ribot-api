Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.network "forwarded_port", guest: 4568, host: 4568

  config.vm.synced_folder "./", "/home/vagrant/app"

  # Allow for symlinks in the app folder. This will not work on
  # Windows, and will not work with Vagrant providers other than VirtualBox
  config.vm.provider "virtualbox" do |vb|
    vb.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/app", "1"]
  end

  config.vm.provision :chef_solo do |chef|
    chef.add_recipe "apt"
    chef.add_recipe "build-essential"
    chef.add_recipe "nodejs"
    chef.add_recipe "postgresql::server"

    chef.json = {
      "nodejs" => {
        "version" => "0.10.40"
      },
      "postgresql" => {
        "pg_hba" => [
          {:type => 'local', :db => 'all', :user => 'postgres', :addr => nil, :method => 'ident'},
          {:type => 'local', :db => 'all', :user => 'all', :addr => nil, :method => 'ident'},
          {:type => 'host', :db => 'all', :user => 'all', :addr => '127.0.0.1/32', :method => 'trust'},
          {:type => 'host', :db => 'all', :user => 'all', :addr => '::1/128', :method => 'md5'}
        ],
        "password" => {
          "postgres" => "de7f0527d268ae05a0800d1ef5d574d0"
        }
      }
    }
  end

  config.vm.provision "shell", inline: "sudo -u postgres createuser --createdb --createrole --superuser vagrant || true"
  config.vm.provision "shell", inline: "sudo -u postgres createdb ribot-api \"Dev database\" || true"
  config.vm.provision "shell", inline: "sudo -u postgres createdb ribot-api-test \"Test database\" || true"
end
