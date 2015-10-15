Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.network "private_network", type: "dhcp"
  config.vm.network "forwarded_port", guest: 4568, host: 4568

  config.vm.synced_folder "./", "/home/vagrant/app", type: "nfs"

  config.vm.provider "virtualbox" do |v|
    v.customize ["modifyvm", :id, "--cpuexecutioncap", "50"]
    v.memory = 1024
    v.cpus = 2
  end

  config.vm.provision :chef_solo do |chef|
    chef.add_recipe "apt"
    chef.add_recipe "build-essential"
    chef.add_recipe "nodejs"
    chef.add_recipe "postgresql::server"

    chef.json = {
      "nodejs" => {
        "install_method" => "binary",
        "version" => "0.12.7",
        "binary" => {
          "url" => "https://nodejs.org/dist/v0.12.7/node-v0.12.7-linux-x64.tar.gz",
          "checksum" => "6a2b3077f293d17e2a1e6dba0297f761c9e981c255a2c82f329d4173acf9b9d5"
        }
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
